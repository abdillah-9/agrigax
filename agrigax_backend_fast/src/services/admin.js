const { countUsers, getAllUsers, suspendUser, reinstateUser } = require("../repositories/users");
const { countCategories } = require("../repositories/categories");
const { countListings, countPendingListings } = require("../repositories/listings");
const { listPending, approveListing, rejectListing } = require("../services/listings");
const { countBookings, getAllDisputes, resolveBookingDispute } = require("../services/bookings");
const { countReviews } = require("../repositories/reviews");
const { countOpenDisputes } = require("../repositories/bookings");
const { adminListCategories } = require("../services/categories");
const { adminListReviews } = require("../services/reviews");
const { formatUser } = require("../utils/response");
const AppError = require("../errors/AppError");
const { getDisputeById } = require("../repositories/bookings");

module.exports.getDashboard = async () => {
  const [users, listings, bookings, categories, reviews, pendingListings, openDisputes] = await Promise.all([
    countUsers(),
    countListings(),
    countBookings(),
    countCategories(),
    countReviews(),
    countPendingListings(),
    countOpenDisputes(),
  ]);

  return { users, listings, bookings, categories, reviews, pendingListings, openDisputes };
};

module.exports.listUsers = async (pagination) => {
  const { rows, total } = await getAllUsers(pagination);
  return { data: rows.map(formatUser), total };
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

module.exports.getReviews = async () => {
  return adminListReviews();
};
