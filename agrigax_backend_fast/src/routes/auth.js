const express = require("express");
const {
  login,
  register,
  logout,
  refresh,
  me,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
} = require("../controllers/auth");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const schemas = require("../validations/auth");

const { guards } = require("../configs/accessPolicy");
const authRouter = express.Router();

authRouter.post("/login", validate(schemas.login), asyncHandler(login));
authRouter.post("/register", validate(schemas.register), asyncHandler(register));
authRouter.post("/logout", ...guards.auth, asyncHandler(logout));
authRouter.post("/refresh", asyncHandler(refresh));
authRouter.get("/me", ...guards.auth, asyncHandler(me));
authRouter.post("/forgot-password", validate(schemas.forgotPassword), asyncHandler(forgotPassword));
authRouter.post("/resend-otp", validate(schemas.resendOtp), asyncHandler(resendOtp));
authRouter.post("/verify-otp", validate(schemas.verifyOtp), asyncHandler(verifyOtp));
authRouter.post("/reset-password", validate(schemas.resetPassword), asyncHandler(resetPassword));

module.exports = authRouter;
