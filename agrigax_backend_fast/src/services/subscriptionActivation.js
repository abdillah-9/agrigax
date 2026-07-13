const AppError = require("../errors/AppError");
const { findDefaultPlan } = require("../repositories/subscriptionPlans");
const { insertVendorSubscription } = require("../repositories/vendorSubscriptions");

// Starter auto-assignment — requirements doc §5.1. Runs inside the caller's
// registration transaction so a vendor row and its subscription are created
// atomically or not at all. This is one of exactly three ways a
// vendor_subscriptions row is ever created (docs/09-business-rules.md BR-033);
// the other two (admin approval, expiry fallback) are added in later phases.
module.exports.assignDefaultPlan = async (trx, vendorId) => {
  const defaultPlan = await findDefaultPlan(trx);

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
