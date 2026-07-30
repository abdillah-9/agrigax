const {
  getCurrentSubscription,
  getMySubscriptionHistory,
} = require("../services/vendorSubscriptions");
const { formatVendorSubscription, formatSubscriptionPlan } = require("../utils/formatters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

module.exports.getCurrent = async (req, res, next) => {
  try {
    const { subscription, plan } = await getCurrentSubscription(req.user.id);

    return sendSuccess(
      res,
      {
        ...formatVendorSubscription(subscription),
        plan: plan ? formatSubscriptionPlan(plan) : null,
      },
      "Current subscription fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.getHistory = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await getMySubscriptionHistory(req.user.id, { offset, limit });

    return sendPaginated(
      res,
      rows.map(formatVendorSubscription),
      buildPagination(page, limit, total),
      "Subscription history fetched"
    );
  } catch (e) {
    next(e);
  }
};
