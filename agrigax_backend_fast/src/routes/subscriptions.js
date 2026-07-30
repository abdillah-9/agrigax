const express = require("express");
const { getCurrent, getHistory } = require("../controllers/vendorSubscriptions");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { guards } = require("../configs/accessPolicy");

const subscriptionsRouter = express.Router();

// Vendor-facing view of their own subscription state (requirements §4.4:
// "a vendor's current plan is derived from their active vendor_subscriptions
// row"). Admin views live under /admin/vendor-subscriptions.
subscriptionsRouter.get("/current", ...guards.provider, asyncHandler(getCurrent));
subscriptionsRouter.get("/history", ...guards.provider, asyncHandler(getHistory));

module.exports = subscriptionsRouter;
