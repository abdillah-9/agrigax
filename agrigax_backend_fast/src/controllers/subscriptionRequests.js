const {
  submitRequest,
  listMyRequests,
  getMyRequest,
} = require("../services/subscriptionRequests");
const { formatSubscriptionRequest } = require("../utils/formatters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

module.exports.createRequest = async (req, res, next) => {
  try {
    const request = await submitRequest(req.user.id, req.body);
    return sendSuccess(res, formatSubscriptionRequest(request), "Subscription request submitted", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.getMyRequests = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await listMyRequests(req.user.id, {
      offset,
      limit,
      status: req.query.status,
    });

    return sendPaginated(
      res,
      rows.map(formatSubscriptionRequest),
      buildPagination(page, limit, total),
      "Requests fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.getMyRequestById = async (req, res, next) => {
  try {
    const request = await getMyRequest(req.user.id, req.params.id);
    return sendSuccess(res, formatSubscriptionRequest(request), "Request fetched");
  } catch (e) {
    next(e);
  }
};
