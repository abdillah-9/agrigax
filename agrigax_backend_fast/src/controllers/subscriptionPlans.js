const {
  listPlans,
  getPlan,
  adminListPlans,
  adminGetPlan,
  createPlan,
  updatePlan,
  removePlan,
} = require("../services/subscriptionPlans");
const { formatSubscriptionPlan } = require("../utils/formatters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

module.exports.getPlans = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await listPlans({ offset, limit });

    return sendPaginated(
      res,
      rows.map(formatSubscriptionPlan),
      buildPagination(page, limit, total),
      "Plans fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.getPlanById = async (req, res, next) => {
  try {
    const plan = await getPlan(req.params.id);
    return sendSuccess(res, formatSubscriptionPlan(plan), "Plan fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.adminGetPlans = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await adminListPlans({ offset, limit });

    return sendPaginated(
      res,
      rows.map(formatSubscriptionPlan),
      buildPagination(page, limit, total),
      "Plans fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.adminGetPlanById = async (req, res, next) => {
  try {
    const plan = await adminGetPlan(req.params.id);
    return sendSuccess(res, formatSubscriptionPlan(plan), "Plan fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.createPlan = async (req, res, next) => {
  try {
    const plan = await createPlan(req.body);
    return sendSuccess(res, formatSubscriptionPlan(plan), "Plan created", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await updatePlan(req.params.id, req.body);
    return sendSuccess(res, formatSubscriptionPlan(plan), "Plan updated");
  } catch (e) {
    next(e);
  }
};

module.exports.deletePlan = async (req, res, next) => {
  try {
    await removePlan(req.params.id);
    return sendSuccess(res, null, "Plan deleted");
  } catch (e) {
    next(e);
  }
};
