const express = require("express");
const {
  getDashboard,
  getUsers,
  getProviders,
  suspendUser,
  reinstateUser,
  getPendingListings,
  approveListing,
  rejectListing,
  getDisputes,
  resolveDispute,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getReviews,
  approveReview,
  hideReview,
  deleteReviewHandler,
  getBookings,
  getBooking,
  getConversations,
  getConversationMessages,
} = require("../controllers/admin");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const categorySchemas = require("../validations/categories");
const disputeSchemas = require("../validations/bookings");

const adminRouter = express.Router();
const adminOnly = guards.admin;

adminRouter.get("/dashboard", ...adminOnly, asyncHandler(getDashboard));
adminRouter.get("/users", ...adminOnly, asyncHandler(getUsers));
adminRouter.get("/providers", ...adminOnly, asyncHandler(getProviders));
adminRouter.put("/users/:id/suspend", ...adminOnly, asyncHandler(suspendUser));
adminRouter.put("/users/:id/reinstate", ...adminOnly, asyncHandler(reinstateUser));

adminRouter.get("/listings/pending", ...adminOnly, asyncHandler(getPendingListings));
adminRouter.put("/listings/:id/approve", ...adminOnly, asyncHandler(approveListing));
adminRouter.put("/listings/:id/reject", ...adminOnly, asyncHandler(rejectListing));

adminRouter.get("/categories", ...adminOnly, asyncHandler(getCategories));
adminRouter.post("/categories", ...adminOnly, validate(categorySchemas.create), asyncHandler(createCategory));
adminRouter.put("/categories/:id", ...adminOnly, validate(categorySchemas.update), asyncHandler(updateCategory));
adminRouter.delete("/categories/:id", ...adminOnly, asyncHandler(deleteCategory));

adminRouter.get("/bookings", ...adminOnly, asyncHandler(getBookings));
adminRouter.get("/bookings/:id", ...adminOnly, asyncHandler(getBooking));

adminRouter.get("/messages/conversations", ...adminOnly, asyncHandler(getConversations));
adminRouter.get("/messages/:id", ...adminOnly, asyncHandler(getConversationMessages));

adminRouter.get("/disputes", ...adminOnly, asyncHandler(getDisputes));
adminRouter.put("/disputes/:id/resolve", ...adminOnly, validate(disputeSchemas.resolveDispute), asyncHandler(resolveDispute));

adminRouter.get("/reviews", ...adminOnly, asyncHandler(getReviews));
adminRouter.put("/reviews/:id/approve", ...adminOnly, asyncHandler(approveReview));
adminRouter.put("/reviews/:id/hide", ...adminOnly, asyncHandler(hideReview));
adminRouter.delete("/reviews/:id", ...adminOnly, asyncHandler(deleteReviewHandler));

module.exports = adminRouter;
