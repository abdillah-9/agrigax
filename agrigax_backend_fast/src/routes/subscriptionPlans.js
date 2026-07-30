const express = require("express");
const { getPlans, getPlanById } = require("../controllers/subscriptionPlans");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { guards } = require("../configs/accessPolicy");

const subscriptionPlansRouter = express.Router();

// Vendor-facing only — active plans a vendor can browse/select to upgrade to
// (requirements §6 step 1). Admin management lives under /admin/subscription-plans.
subscriptionPlansRouter.get("/", ...guards.provider, asyncHandler(getPlans));
subscriptionPlansRouter.get("/:id", ...guards.provider, asyncHandler(getPlanById));

module.exports = subscriptionPlansRouter;
