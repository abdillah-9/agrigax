const AppError = require("../errors/AppError");
const {
  getAllSubscriptions,
  findActiveByVendor,
  getHistoryByVendor,
} = require("../repositories/vendorSubscriptions");
const { getPlanById } = require("../repositories/subscriptionPlans");

// Vendor-facing "what plan am I on right now" — the active row plus its plan
// (features/limits included) so the frontend can render entitlements without
// a second call (docs/02-api-specification.md §4).
module.exports.getCurrentSubscription = async (vendorId) => {
  const subscription = await findActiveByVendor(vendorId);

  if (!subscription) {
    // Should not happen for a correctly provisioned vendor (§8: every vendor
    // always has some active subscription) — surfaced as 404 rather than
    // hidden, since it signals a provisioning gap.
    throw new AppError("No active subscription found", 404);
  }

  const plan = await getPlanById(subscription.plan_id);

  return { subscription, plan };
};

// Vendor-facing subscription history, scoped strictly to the requesting vendor.
module.exports.getMySubscriptionHistory = async (vendorId, { offset, limit }) => {
  return getHistoryByVendor({ vendor_id: vendorId, offset, limit });
};

// §9 "Subscriptions": history/active/expired/upcoming all through one query,
// selected via filters rather than four separate endpoints
// (docs/02-api-specification.md §10).
module.exports.adminListSubscriptions = async ({ offset, limit, status, vendorId, planId, expiringWithinDays }) => {
  return getAllSubscriptions({
    offset,
    limit,
    status,
    vendor_id: vendorId,
    plan_id: planId,
    expiringWithinDays,
  });
};
