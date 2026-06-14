const {
  getDashboard,
  listUsers,
  suspend,
  reinstate,
  getPendingListings,
  approve,
  reject,
  getDisputes,
  resolveDispute,
  getCategories,
  getReviews,
} = require("../services/admin");
const { createCategory, updateCategory, removeCategory } = require("../services/categories");
const { formatCategory } = require("../utils/formatters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

module.exports.getDashboard = async (req, res, next) => {
  try {
    const data = await getDashboard();
    return sendSuccess(res, data, "Dashboard fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { data, total } = await listUsers({ offset, limit });
    return sendPaginated(res, data, buildPagination(page, limit, total), "Users fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.suspendUser = async (req, res, next) => {
  try {
    await suspend(req.params.id);
    return sendSuccess(res, null, "User suspended");
  } catch (e) {
    next(e);
  }
};

module.exports.reinstateUser = async (req, res, next) => {
  try {
    await reinstate(req.params.id);
    return sendSuccess(res, null, "User reinstated");
  } catch (e) {
    next(e);
  }
};

module.exports.getPendingListings = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { data, total } = await getPendingListings({ offset, limit });
    return sendPaginated(res, data, buildPagination(page, limit, total), "Pending listings fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.approveListing = async (req, res, next) => {
  try {
    const data = await approve(req.params.id);
    return sendSuccess(res, data, "Listing approved");
  } catch (e) {
    next(e);
  }
};

module.exports.rejectListing = async (req, res, next) => {
  try {
    await reject(req.params.id);
    return sendSuccess(res, null, "Listing rejected");
  } catch (e) {
    next(e);
  }
};

module.exports.getDisputes = async (req, res, next) => {
  try {
    const data = await getDisputes();
    return sendSuccess(res, data, "Disputes fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.resolveDispute = async (req, res, next) => {
  try {
    const data = await resolveDispute(req.params.id, req.body);
    return sendSuccess(res, data, "Dispute resolved");
  } catch (e) {
    next(e);
  }
};

module.exports.getCategories = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await getCategories({ offset, limit });
    return sendPaginated(res, rows.map(formatCategory), buildPagination(page, limit, total), "Categories fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.createCategory = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    return sendSuccess(res, formatCategory(category), "Category created", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.updateCategory = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    return sendSuccess(res, formatCategory(category), "Category updated");
  } catch (e) {
    next(e);
  }
};

module.exports.getReviews = async (req, res, next) => {
  try {
    const data = await getReviews();
    return sendSuccess(res, data, "Reviews fetched");
  } catch (e) {
    next(e);
  }
};
