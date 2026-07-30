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
  getConversations,
  getConversationMessages,
  getSubscriptionPlans,
  getSubscriptionPlan,
  getPaymentMethods,
  getSubscriptionRequests,
  getSubscriptionRequest,
  getVendorSubscriptions,
  getRevenueReport,
  getVendorCountsReport,
  getRequestsReport,
  getExpirationsReport,
} = require("../services/admin");
const { createCategory, updateCategory, removeCategory } = require("../services/categories");
const {
  createPlan,
  updatePlan,
  removePlan,
} = require("../services/subscriptionPlans");
const {
  createPaymentMethod,
  updatePaymentMethod,
} = require("../services/paymentMethods");
const { approveRequest, rejectRequest } = require("../services/subscriptionActivation");
const {
  formatCategory,
  formatSubscriptionPlan,
  formatPaymentMethod,
  formatSubscriptionRequest,
  formatSubscriptionRequestLog,
  formatVendorSubscription,
} = require("../utils/formatters");
const parseDate = (value) => (value ? new Date(value) : undefined);
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

module.exports.getSubscriptionPlans = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { rows, total } = await getSubscriptionPlans(pagination);
    return sendPaginated(
      res,
      rows.map(formatSubscriptionPlan),
      buildPagination(pagination.page, pagination.limit, total),
      "Plans fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.getSubscriptionPlanById = async (req, res, next) => {
  try {
    const plan = await getSubscriptionPlan(req.params.id);
    return sendSuccess(res, formatSubscriptionPlan(plan), "Plan fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.createSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await createPlan(req.body);
    return sendSuccess(res, formatSubscriptionPlan(plan), "Plan created", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.updateSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await updatePlan(req.params.id, req.body);
    return sendSuccess(res, formatSubscriptionPlan(plan), "Plan updated");
  } catch (e) {
    next(e);
  }
};

module.exports.deleteSubscriptionPlan = async (req, res, next) => {
  try {
    await removePlan(req.params.id);
    return sendSuccess(res, null, "Plan deleted");
  } catch (e) {
    next(e);
  }
};

module.exports.getPaymentMethods = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { rows, total } = await getPaymentMethods(pagination);
    return sendPaginated(
      res,
      rows.map(formatPaymentMethod),
      buildPagination(pagination.page, pagination.limit, total),
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

module.exports.getSubscriptionRequests = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { rows, total } = await getSubscriptionRequests({
      ...pagination,
      status: req.query.status,
      vendor_id: req.query.vendorId,
    });

    return sendPaginated(
      res,
      rows.map(formatSubscriptionRequest),
      buildPagination(pagination.page, pagination.limit, total),
      "Subscription requests fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.getSubscriptionRequestById = async (req, res, next) => {
  try {
    const { request, logs } = await getSubscriptionRequest(req.params.id);
    return sendSuccess(
      res,
      { ...formatSubscriptionRequest(request), logs: logs.map(formatSubscriptionRequestLog) },
      "Subscription request fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.approveSubscriptionRequest = async (req, res, next) => {
  try {
    const { request, subscription } = await approveRequest(req.user.id, req.params.id);
    return sendSuccess(
      res,
      { request: formatSubscriptionRequest(request), subscription: formatVendorSubscription(subscription) },
      "Subscription request approved"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.rejectSubscriptionRequest = async (req, res, next) => {
  try {
    const request = await rejectRequest(req.user.id, req.params.id, req.body?.comment);
    return sendSuccess(res, formatSubscriptionRequest(request), "Subscription request rejected");
  } catch (e) {
    next(e);
  }
};

module.exports.getVendorSubscriptions = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { rows, total } = await getVendorSubscriptions({
      ...pagination,
      status: req.query.status,
      vendorId: req.query.vendorId,
      planId: req.query.planId,
      expiringWithinDays: req.query.expiringWithinDays ? Number(req.query.expiringWithinDays) : undefined,
    });

    return sendPaginated(
      res,
      rows.map(formatVendorSubscription),
      buildPagination(pagination.page, pagination.limit, total),
      "Vendor subscriptions fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.getRevenueReport = async (req, res, next) => {
  try {
    const report = await getRevenueReport(req.query.period);
    return sendSuccess(res, report, "Revenue report fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getVendorCountsReport = async (req, res, next) => {
  try {
    const report = await getVendorCountsReport();
    return sendSuccess(res, report, "Vendor counts report fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getRequestsReport = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const report = await getRequestsReport({
      ...pagination,
      status: req.query.status,
      from: parseDate(req.query.from),
      to: parseDate(req.query.to),
    });
    return sendSuccess(res, report, "Requests report fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getExpirationsReport = async (req, res, next) => {
  try {
    const report = await getExpirationsReport();
    return sendSuccess(res, report, "Expirations report fetched");
  } catch (e) {
    next(e);
  }
};
