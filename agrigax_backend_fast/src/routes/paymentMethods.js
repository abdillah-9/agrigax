const express = require("express");
const { getPaymentMethods } = require("../controllers/paymentMethods");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { guards } = require("../configs/accessPolicy");

const paymentMethodsRouter = express.Router();

// Vendor-facing only — active payment instructions shown during upgrade
// (requirements §6 step 2). Admin management lives under /admin/payment-methods.
paymentMethodsRouter.get("/", ...guards.provider, asyncHandler(getPaymentMethods));

module.exports = paymentMethodsRouter;
