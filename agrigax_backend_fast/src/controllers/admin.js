const {
  getDashboard,
  listUsers,
  listProviders,
  suspend,
  reinstate,
  getPendingListings,
  approve,
  reject,
  getDisputes,
  resolveDispute,
  getCategories,
  getReviews,
  approveReview,
  hideReview,
  deleteReview,
  getBookings,
  getBooking,
  getPayments,
  getRefunds,
  getTransactions,
  getConversations,
  getConversationMessages,
} = require("../services/admin");
const { createCategory, updateCategory, removeCategory } = require("../services/categories");
const { formatCategory } = require("../utils/formatters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

const listFilters = (query, pagination) => ({
  ...pagination,
  status: query.status,
  role: query.role,
  suspended: query.suspended,
  search: query.search,
  type: query.type,
});

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
    const pagination = parsePagination(req.query);
    const { data, total } = await listUsers(listFilters(req.query, pagination));
    return sendPaginated(res, data, buildPagination(pagination.page, pagination.limit, total), "Users fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getProviders = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { data, total } = await listProviders(listFilters(req.query, pagination));
    return sendPaginated(res, data, buildPagination(pagination.page, pagination.limit, total), "Providers fetched");
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
    const pagination = parsePagination(req.query);
    const { data, total } = await getPendingListings(pagination);
    return sendPaginated(res, data, buildPagination(pagination.page, pagination.limit, total), "Pending listings fetched");
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
    const pagination = parsePagination(req.query);
    const { rows, total } = await getCategories(pagination);
    return sendPaginated(res, rows.map(formatCategory), buildPagination(pagination.page, pagination.limit, total), "Categories fetched");
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

module.exports.deleteCategory = async (req, res, next) => {
  try {
    await removeCategory(req.params.id);
    return sendSuccess(res, null, "Category deleted");
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

module.exports.approveReview = async (req, res, next) => {
  try {
    const data = await approveReview(req.params.id);
    return sendSuccess(res, data, "Review approved");
  } catch (e) {
    next(e);
  }
};

module.exports.hideReview = async (req, res, next) => {
  try {
    const data = await hideReview(req.params.id);
    return sendSuccess(res, data, "Review hidden");
  } catch (e) {
    next(e);
  }
};

module.exports.deleteReviewHandler = async (req, res, next) => {
  try {
    await deleteReview(req.params.id);
    return sendSuccess(res, null, "Review deleted");
  } catch (e) {
    next(e);
  }
};

module.exports.getBookings = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { data, total } = await getBookings(listFilters(req.query, pagination));
    return sendPaginated(res, data, buildPagination(pagination.page, pagination.limit, total), "Bookings fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getBooking = async (req, res, next) => {
  try {
    const data = await getBooking(req.params.id);
    return sendSuccess(res, data, "Booking fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getPayments = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { data, total } = await getPayments(listFilters(req.query, pagination));
    return sendPaginated(res, data, buildPagination(pagination.page, pagination.limit, total), "Payments fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getRefunds = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { data, total } = await getRefunds(pagination);
    return sendPaginated(res, data, buildPagination(pagination.page, pagination.limit, total), "Refunds fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getTransactions = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { data, total } = await getTransactions(listFilters(req.query, pagination));
    return sendPaginated(res, data, buildPagination(pagination.page, pagination.limit, total), "Transactions fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getConversations = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { data, total } = await getConversations(pagination);
    return sendPaginated(res, data, buildPagination(pagination.page, pagination.limit, total), "Conversations fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getConversationMessages = async (req, res, next) => {
  try {
    const data = await getConversationMessages(req.params.id);
    return sendSuccess(res, data, "Conversation messages fetched");
  } catch (e) {
    next(e);
  }
};
