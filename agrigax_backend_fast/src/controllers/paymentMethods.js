const {
  listPaymentMethods,
  adminListPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
} = require("../services/paymentMethods");
const { formatPaymentMethod } = require("../utils/formatters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

module.exports.getPaymentMethods = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await listPaymentMethods({ offset, limit });

    return sendPaginated(
      res,
      rows.map(formatPaymentMethod),
      buildPagination(page, limit, total),
      "Payment methods fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.adminGetPaymentMethods = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await adminListPaymentMethods({ offset, limit });

    return sendPaginated(
      res,
      rows.map(formatPaymentMethod),
      buildPagination(page, limit, total),
      "Payment methods fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.createPaymentMethod = async (req, res, next) => {
  try {
    const method = await createPaymentMethod(req.body);
    return sendSuccess(res, formatPaymentMethod(method), "Payment method created", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const method = await updatePaymentMethod(req.params.id, req.body);
    return sendSuccess(res, formatPaymentMethod(method), "Payment method updated");
  } catch (e) {
    next(e);
  }
};
