const db = require("../configs/db");
const AppError = require("../errors/AppError");
// Namespace require (not destructured) so tests can stub findDefaultPlan
// with vi.spyOn on the shared CJS exports object.
const subscriptionPlansRepo = require("../repositories/subscriptionPlans");
const {
  insertVendorSubscription,
  findActiveByVendor,
  setSubscriptionStatus,
} = require("../repositories/vendorSubscriptions");
const { getRequestById, updateRequestStatus } = require("../repositories/subscriptionRequests");
const { insertLog } = require("../repositories/subscriptionRequestLogs");
const { createNotification } = require("../repositories/notifications");

// Starter auto-assignment — requirements doc §5.1. Runs inside the caller's
// registration transaction so a vendor row and its subscription are created
// atomically or not at all. This is one of exactly three ways a
// vendor_subscriptions row is ever created (docs/09-business-rules.md BR-033);
// the other two (admin approval, expiry fallback) are added in later phases.
module.exports.assignDefaultPlan = async (trx, vendorId) => {
  const defaultPlan = await subscriptionPlansRepo.findDefaultPlan(trx);

  if (!defaultPlan) {
    // Misconfiguration, not a user error — must fail loudly rather than
    // silently register a vendor with no subscription (docs/03-development-roadmap.md Phase 2).
    throw new AppError(
      "No plan is flagged is_default_vendor_plan — cannot assign a default plan to a new vendor",
      500
    );
  }

  return insertVendorSubscription(trx, {
    vendor_id: vendorId,
    plan_id: defaultPlan.id,
    status: "active",
    start_date: trx.fn.now(),
    end_date: null,
    created_from_request_id: null,
  });
};

// Admin approves a pending request — requirements §4.6, §5, §6 step 7.
// Everything in the transaction below is one of exactly four writes §4.6
// rule 2 scopes to a single atomic unit: deactivate old, insert new, update
// the request, insert the audit log. Notification is deliberately outside
// the transaction — it is not one of those four writes.
module.exports.approveRequest = async (adminId, requestId) => {
  const request = await getRequestById(requestId);

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (request.status !== "pending") {
    throw new AppError("Only pending requests can be approved", 409);
  }

  const plan = await subscriptionPlansRepo.getPlanById(request.plan_id);

  if (!plan) {
    throw new AppError("Plan no longer exists", 404);
  }

  const { updatedRequest, newSubscription } = await db.transaction(async (trx) => {
    // §4.6 rule 3: deactivate the vendor's existing active subscription
    // strictly before creating the new one, in this order, within this
    // transaction. Status "cancelled" (not "expired") is used here because
    // this termination is approval-triggered, not the natural end_date
    // lapse that the Phase 7 expiry job marks as "expired" — the schema's
    // status enum (§4.4) lists both as valid flip targets without assigning
    // either to a specific trigger, so this is the deliberate mapping.
    const currentActive = await findActiveByVendor(request.vendor_id, trx);

    if (currentActive) {
      await setSubscriptionStatus(trx, currentActive.id, "cancelled");
    }

    const newSubscriptionId = await insertVendorSubscription(trx, {
      vendor_id: request.vendor_id,
      plan_id: plan.id,
      status: "active",
      start_date: trx.fn.now(),
      end_date: trx.raw("DATE_ADD(NOW(), INTERVAL ? DAY)", [plan.duration_days]),
      created_from_request_id: request.id,
    });

    const updatedRequest = await updateRequestStatus(trx, request.id, {
      status: "approved",
      verified_by: adminId,
      verified_at: trx.fn.now(),
    });

    await insertLog(trx, {
      request_id: request.id,
      admin_id: adminId,
      action: "approved",
      comment: null,
    });

    const newSubscription = await trx("vendor_subscriptions").where({ id: newSubscriptionId }).first();

    return { updatedRequest, newSubscription };
  });

  // "payment" is the closest fit in the notifications.type enum (§10 event:
  // subscription request approved is fundamentally a payment-verification outcome).
  await createNotification({
    user_id: request.vendor_id,
    title: "Subscription approved",
    body: `Your subscription request for ${plan.name} has been approved.`,
    type: "payment",
    is_read: false,
  });

  return { request: updatedRequest, subscription: newSubscription };
};

// Admin rejects a pending request — requirements §6 step 7, §4.5. Only
// touches subscription_requests and subscription_request_logs; the vendor's
// existing active subscription is never modified (§5 diagram, reject path).
module.exports.rejectRequest = async (adminId, requestId, comment) => {
  const request = await getRequestById(requestId);

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (request.status !== "pending") {
    throw new AppError("Only pending requests can be rejected", 409);
  }

  const updatedRequest = await db.transaction(async (trx) => {
    const updated = await updateRequestStatus(trx, request.id, {
      status: "rejected",
      verified_by: adminId,
      verified_at: trx.fn.now(),
    });

    // The rejection reason lives on the log's comment, not a separate field
    // on subscription_requests itself — resolved decision, requirements §12.4.
    await insertLog(trx, {
      request_id: request.id,
      admin_id: adminId,
      action: "rejected",
      comment: comment ?? null,
    });

    return updated;
  });

  await createNotification({
    user_id: request.vendor_id,
    title: "Subscription request rejected",
    body: comment || "Your subscription request was rejected.",
    type: "payment",
    is_read: false,
  });

  return updatedRequest;
};
