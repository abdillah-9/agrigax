const express = require("express");
const {
  getDashboard,
  getUsers,
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
  getReviews,
} = require("../controllers/admin");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const schemas = require("../validations/categories");
const disputeSchemas = require("../validations/bookings");

const adminRouter = express.Router();

adminRouter.get("/dashboard", ...guards.admin, asyncHandler(getDashboard));
adminRouter.get("/users", ...guards.admin, asyncHandler(getUsers));
adminRouter.put("/users/:id/suspend", ...guards.admin, asyncHandler(suspendUser));
adminRouter.put("/users/:id/reinstate", ...guards.admin, asyncHandler(reinstateUser));
adminRouter.get("/listings/pending", ...guards.admin, asyncHandler(getPendingListings));
adminRouter.put("/listings/:id/approve", ...guards.admin, asyncHandler(approveListing));
adminRouter.put("/listings/:id/reject", ...guards.admin, asyncHandler(rejectListing));
adminRouter.get("/categories", ...guards.admin, asyncHandler(getCategories));
adminRouter.post("/categories", ...guards.admin, validate(schemas.create), asyncHandler(createCategory));
adminRouter.put("/categories/:id", ...guards.admin, validate(schemas.update), asyncHandler(updateCategory));
adminRouter.get("/disputes", ...guards.admin, asyncHandler(getDisputes));
adminRouter.put("/disputes/:id/resolve", ...guards.admin, validate(disputeSchemas.resolveDispute), asyncHandler(resolveDispute));
adminRouter.get("/reviews", ...guards.admin, asyncHandler(getReviews));

module.exports = adminRouter;
