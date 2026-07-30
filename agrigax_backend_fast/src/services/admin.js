const { countUsers, getAllUsers, getAdminProviders, suspendUser, reinstateUser } = require("../repositories/users");
const { countCategories } = require("../repositories/categories");
const { countListings, countPendingListings } = require("../repositories/listings");
const { countBookings, countOpenDisputes, getDisputeById } = require("../repositories/bookings");
const { countReviews } = require("../repositories/reviews");
const { listPending, approveListing, rejectListing } = require("../services/listings");
const {
  getAllDisputes,
  resolveBookingDispute,
  adminListBookings,
  adminGetBooking,
} = require("../services/bookings");
const { adminListCategories } = require("../services/categories");
const { adminListPlans, adminGetPlan } = require("../services/subscriptionPlans");
const { adminListPaymentMethods } = require("../services/paymentMethods");
const { adminListRequests, adminGetRequest } = require("../services/subscriptionRequests");
const { adminListSubscriptions } = require("../services/vendorSubscriptions");
const {
  getRevenueReport,
  getVendorCountsReport,
  getRequestsReport,
  getExpirationsReport,
} = require("../services/adminReporting");
const {
  adminListReviews,
  adminApproveReview,
  adminHideReview,
  adminDeleteReview,
} = require("../services/reviews");
const {
  adminListConversations,
  adminGetConversationMessages,
  countAllConversations,
} = require("../services/messages");
const { formatUser } = require("../utils/response");
const { formatAdminProvider } = require("../utils/formatters");
const AppError = require("../errors/AppError");

module.exports.getDashboard = async () => {
  const [
    users,
    listings,
    bookings,
    categories,
    reviews,
    pendingListings,
    openDisputes,
    conversations,
  ] = await Promise.all([
    countUsers(),
    countListings(),
    countBookings(),
    countCategories(),
    countReviews(),
    countPendingListings(),
    countOpenDisputes(),
    countAllConversations(),
  ]);

  return {
    users,
    listings,
    bookings,
    categories,
    reviews,
    pendingListings,
    openDisputes,
    conversations,
  };
};

module.exports.listUsers = async (filters) => {
  const { rows, total } = await getAllUsers(filters);
  return { data: rows.map(formatUser), total };
};

module.exports.listProviders = async (filters) => {
  const { rows, total } = await getAdminProviders(filters);
  return { data: rows.map(formatAdminProvider), total };
};

module.exports.suspend = async (id) => {
  await suspendUser(id);
};

module.exports.reinstate = async (id) => {
  await reinstateUser(id);
};

module.exports.getPendingListings = async (pagination) => {
  return listPending(pagination);
};

module.exports.approve = async (id) => {
  return approveListing(id);
};

module.exports.reject = async (id) => {
  await rejectListing(id);
};

module.exports.getDisputes = async () => {
  return getAllDisputes();
};

module.exports.resolveDispute = async (id, body) => {
  const dispute = await getDisputeById(id);
  if (!dispute) throw new AppError("Dispute not found", 404);
  return resolveBookingDispute(id, body);
};

module.exports.getCategories = async (pagination) => {
  return adminListCategories(pagination);
};

module.exports.getSubscriptionPlans = async (pagination) => {
  return adminListPlans(pagination);
};

module.exports.getSubscriptionPlan = async (id) => {
  return adminGetPlan(id);
};

module.exports.getPaymentMethods = async (pagination) => {
  return adminListPaymentMethods(pagination);
};

module.exports.getSubscriptionRequests = async (filters) => {
  return adminListRequests(filters);
};

module.exports.getSubscriptionRequest = async (id) => {
  return adminGetRequest(id);
};

module.exports.getVendorSubscriptions = async (filters) => {
  return adminListSubscriptions(filters);
};

module.exports.getRevenueReport = async (period) => {
  return getRevenueReport(period);
};

module.exports.getVendorCountsReport = async () => {
  return getVendorCountsReport();
};

module.exports.getRequestsReport = async (filters) => {
  return getRequestsReport(filters);
};

module.exports.getExpirationsReport = async () => {
  return getExpirationsReport();
};

module.exports.getReviews = async () => {
  return adminListReviews();
};

module.exports.approveReview = async (id) => {
  return adminApproveReview(id);
};

module.exports.hideReview = async (id) => {
  return adminHideReview(id);
};

module.exports.deleteReview = async (id) => {
  await adminDeleteReview(id);
};

module.exports.getBookings = async (filters) => {
  return adminListBookings(filters);
};

module.exports.getBooking = async (id) => {
  return adminGetBooking(id);
};

module.exports.getConversations = async (filters) => {
  return adminListConversations(filters);
};

module.exports.getConversationMessages = async (id) => {
  return adminGetConversationMessages(id);
};
