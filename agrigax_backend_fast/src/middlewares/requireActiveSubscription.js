const AppError = require("../errors/AppError");
// Namespace requires (not destructured) so tests can stub these repository
// functions with vi.spyOn on the shared CJS exports object.
const vendorSubscriptionsRepo = require("../repositories/vendorSubscriptions");
const subscriptionPlansRepo = require("../repositories/subscriptionPlans");

const SUBSCRIPTION_REQUIRED_MESSAGE = "An active subscription is required for this action";

const parseJsonField = (value) => {
  if (!value) return {};
  return typeof value === "string" ? JSON.parse(value) : value;
};

// end_date=null means permanent (the default/Starter plan, §12.1) — only a
// non-null end_date in the past counts as expired.
const isExpired = (subscription) =>
  subscription.end_date !== null && new Date(subscription.end_date) < new Date();

const deny = (next) =>
  next(new AppError(SUBSCRIPTION_REQUIRED_MESSAGE, 403, { code: "SUBSCRIPTION_REQUIRED" }));

// requirements §8. requiredCheck, if given, is "features.<key>" (must be
// === true) or "limits.<key>" (must be > 0). Never applied to customer
// routes — only mounted on the vendor-only actions listed in §8.
module.exports.requireActiveSubscription = (requiredCheck) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError("Not authorised", 401));
      }

      const subscription = await vendorSubscriptionsRepo.findActiveByVendor(req.user.id);

      if (!subscription || isExpired(subscription)) {
        return deny(next);
      }

      if (requiredCheck) {
        const [group, key] = requiredCheck.split(".");
        const plan = await subscriptionPlansRepo.getPlanById(subscription.plan_id);
        const values = plan ? parseJsonField(plan[group]) : {};
        const value = values[key];

        const satisfied = group === "limits" ? Number(value) > 0 : value === true;

        if (!satisfied) {
          return deny(next);
        }
      }

      req.subscription = subscription;
      return next();
    } catch (e) {
      return next(e);
    }
  };
};
