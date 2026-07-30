const express = require("express");
const {
  createRequest,
  getMyRequests,
  getMyRequestById,
} = require("../controllers/subscriptionRequests");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const schemas = require("../validations/subscriptionRequests");

const subscriptionRequestsRouter = express.Router();

// Vendor-facing only, scoped to the authenticated vendor's own requests
// (requirements §6 steps 4-5). Admin review/approval lives under
// /admin/subscription-requests, added in a later phase.
subscriptionRequestsRouter.post("/", ...guards.provider, validate(schemas.create), asyncHandler(createRequest));
subscriptionRequestsRouter.get("/", ...guards.provider, asyncHandler(getMyRequests));
subscriptionRequestsRouter.get("/:id", ...guards.provider, asyncHandler(getMyRequestById));

module.exports = subscriptionRequestsRouter;
