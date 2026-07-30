const AppError = require("../errors/AppError");
const {
  createRequest,
  getRequestById,
  getRequestsByVendor,
  getAllRequests,
} = require("../repositories/subscriptionRequests");
const { getLogsByRequest } = require("../repositories/subscriptionRequestLogs");
const { getPlanById } = require("../repositories/subscriptionPlans");
const { getPaymentMethodById } = require("../repositories/paymentMethods");

// Vendor submits proof of an off-platform payment (requirements §6 step 4).
// This only ever creates a subscription_requests row with status=pending —
// it never touches vendor_subscriptions (§4.3). Whether a vendor may hold
// more than one pending request at once is an open decision (§12.7) and is
// deliberately not enforced here either way.
module.exports.submitRequest = async (vendorId, body) => {
  const planId = body.plan_id || body.planId;
  const paymentMethodId = body.payment_method || body.paymentMethodId;

  const plan = await getPlanById(planId);

  if (!plan || !plan.is_active) {
    throw new AppError("Plan not found", 404);
  }

  const method = await getPaymentMethodById(paymentMethodId);

  if (!method) {
    throw new AppError("Payment method not found", 404);
  }

  return createRequest({
    vendor_id: vendorId,
    plan_id: planId,
    payment_method: paymentMethodId,
    amount: body.amount,
    transaction_reference: body.transaction_reference || body.transactionReference,
    receipt_url: body.receipt_url || body.receiptUrl || null,
    notes: body.notes ?? null,
    status: "pending",
  });
};

module.exports.listMyRequests = async (vendorId, { offset, limit, status }) => {
  return getRequestsByVendor({ vendor_id: vendorId, offset, limit, status });
};

// Scoped strictly to the requesting vendor — a vendor can never view another
// vendor's request (requirements §6 step 5, actor separation in §1).
module.exports.getMyRequest = async (vendorId, id) => {
  const request = await getRequestById(id);

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (Number(request.vendor_id) !== Number(vendorId)) {
    throw new AppError("You do not have access to this request", 403);
  }

  return request;
};

// Admin-facing (§9 "Subscription requests"): all requests, filterable by
// status/vendor, no ownership scoping.
module.exports.adminListRequests = async ({ offset, limit, status, vendor_id }) => {
  return getAllRequests({ offset, limit, status, vendor_id });
};

// Embeds the subscription_request_logs audit trail inline rather than a
// separate endpoint, since a request's logs are always viewed in the
// context of that request (§4.5, §9).
module.exports.adminGetRequest = async (id) => {
  const request = await getRequestById(id);

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  const logs = await getLogsByRequest(id);

  return { request, logs };
};
