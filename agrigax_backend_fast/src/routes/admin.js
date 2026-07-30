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
  getSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  getSubscriptionRequests,
  getSubscriptionRequestById,
  approveSubscriptionRequest,
  rejectSubscriptionRequest,
  getVendorSubscriptions,
  getRevenueReport,
  getVendorCountsReport,
  getRequestsReport,
  getExpirationsReport,
} = require("../controllers/admin");
const {
  adminList: getCatalogImages,
  adminCreate: createCatalogImage,
  adminUpdate: updateCatalogImage,
  adminDelete: deleteCatalogImage,
  adminListRequests: getCatalogRequests,
  adminResolveRequest: resolveCatalogRequest,
} = require("../controllers/catalogImages");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const categorySchemas = require("../validations/categories");
const disputeSchemas = require("../validations/bookings");
const subscriptionPlanSchemas = require("../validations/subscriptionPlans");
const paymentMethodSchemas = require("../validations/paymentMethods");
const subscriptionRequestSchemas = require("../validations/subscriptionRequests");
const catalogImageSchemas = require("../validations/catalogImages");

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

adminRouter.get("/subscription-plans", ...adminOnly, asyncHandler(getSubscriptionPlans));
adminRouter.get("/subscription-plans/:id", ...adminOnly, asyncHandler(getSubscriptionPlanById));
adminRouter.post("/subscription-plans", ...adminOnly, validate(subscriptionPlanSchemas.create), asyncHandler(createSubscriptionPlan));
adminRouter.put("/subscription-plans/:id", ...adminOnly, validate(subscriptionPlanSchemas.update), asyncHandler(updateSubscriptionPlan));
adminRouter.delete("/subscription-plans/:id", ...adminOnly, asyncHandler(deleteSubscriptionPlan));

adminRouter.get("/payment-methods", ...adminOnly, asyncHandler(getPaymentMethods));
adminRouter.post("/payment-methods", ...adminOnly, validate(paymentMethodSchemas.create), asyncHandler(createPaymentMethod));
adminRouter.put("/payment-methods/:id", ...adminOnly, validate(paymentMethodSchemas.update), asyncHandler(updatePaymentMethod));

adminRouter.get("/subscription-requests", ...adminOnly, asyncHandler(getSubscriptionRequests));
adminRouter.get("/subscription-requests/:id", ...adminOnly, asyncHandler(getSubscriptionRequestById));
adminRouter.post("/subscription-requests/:id/approve", ...adminOnly, asyncHandler(approveSubscriptionRequest));
adminRouter.post("/subscription-requests/:id/reject", ...adminOnly, validate(subscriptionRequestSchemas.reject), asyncHandler(rejectSubscriptionRequest));

adminRouter.get("/vendor-subscriptions", ...adminOnly, asyncHandler(getVendorSubscriptions));

adminRouter.get("/reports/revenue", ...adminOnly, asyncHandler(getRevenueReport));
adminRouter.get("/reports/vendors", ...adminOnly, asyncHandler(getVendorCountsReport));
adminRouter.get("/reports/requests", ...adminOnly, asyncHandler(getRequestsReport));
adminRouter.get("/reports/expirations", ...adminOnly, asyncHandler(getExpirationsReport));

adminRouter.get("/catalog-images", ...adminOnly, asyncHandler(getCatalogImages));
adminRouter.post("/catalog-images", ...adminOnly, validate(catalogImageSchemas.createImage), asyncHandler(createCatalogImage));
adminRouter.put("/catalog-images/:id", ...adminOnly, validate(catalogImageSchemas.updateImage), asyncHandler(updateCatalogImage));
adminRouter.delete("/catalog-images/:id", ...adminOnly, asyncHandler(deleteCatalogImage));

adminRouter.get("/catalog-requests", ...adminOnly, asyncHandler(getCatalogRequests));
adminRouter.put("/catalog-requests/:id", ...adminOnly, validate(catalogImageSchemas.resolveRequest), asyncHandler(resolveCatalogRequest));

adminRouter.get("/disputes", ...adminOnly, asyncHandler(getDisputes));
adminRouter.put("/disputes/:id/resolve", ...adminOnly, validate(disputeSchemas.resolveDispute), asyncHandler(resolveDispute));

adminRouter.get("/reviews", ...adminOnly, asyncHandler(getReviews));
adminRouter.put("/reviews/:id/approve", ...adminOnly, asyncHandler(approveReview));
adminRouter.put("/reviews/:id/hide", ...adminOnly, asyncHandler(hideReview));
adminRouter.delete("/reviews/:id", ...adminOnly, asyncHandler(deleteReviewHandler));

module.exports = adminRouter;
