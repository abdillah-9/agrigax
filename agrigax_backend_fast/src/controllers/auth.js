const {
  login,
  register,
  logout,
  refreshSession,
  getMe,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
} = require("../services/auth");
const { setAuthCookies, clearAuthCookies, setResetCookie, clearResetCookie, ACCESS_COOKIE, REFRESH_COOKIE, RESET_COOKIE } = require("../utils/cookies");
const { attachDevOtp } = require("../utils/devOtp");
const { formatUser, sendSuccess } = require("../utils/response");

const mapRegisterBody = (body) => ({
  username: body.username,
  full_name: body.fullName || body.full_name,
  phone: body.phone,
  email: body.email || null,
  password: body.password,
  active_role: body.role || body.active_role || "customer",
});

module.exports.login = async (req, res, next) => {
  try {
    const { user, access_token_hash, refresh_token_hash } = await login(req.body);

    setAuthCookies(res, { access_token_hash, refresh_token_hash });

    return sendSuccess(res, { user: formatUser(user) }, "You have successfully signed in");
  } catch (e) {
    next(e);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { user, access_token_hash, refresh_token_hash, requiresVerification, devOtp } = await register(
      mapRegisterBody(req.body)
    );

    setAuthCookies(res, { access_token_hash, refresh_token_hash });

    if (devOtp) {
      console.log("\n========================================");
      console.log(`[AgriGax] REGISTER OTP for ${user.phone}: ${devOtp}`);
      console.log("========================================\n");
    }

    return sendSuccess(
      res,
      attachDevOtp({ user: formatUser(user), requiresVerification }, devOtp),
      "Account created successfully. Please verify your OTP."
    );
  } catch (e) {
    next(e);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    await logout({
      access_token_hash: req.cookies?.[ACCESS_COOKIE],
      refresh_token_hash: req.cookies?.[REFRESH_COOKIE],
    });

    clearAuthCookies(res);
    clearResetCookie(res);

    return sendSuccess(res, null, "You have successfully signed out");
  } catch (e) {
    next(e);
  }
};

module.exports.refresh = async (req, res, next) => {
  try {
    const { user, access_token_hash, refresh_token_hash } = await refreshSession({
      access_token_hash: req.cookies?.[ACCESS_COOKIE],
      refresh_token_hash: req.cookies?.[REFRESH_COOKIE],
    });

    setAuthCookies(res, { access_token_hash, refresh_token_hash });

    return sendSuccess(res, { user: formatUser(user) }, "Session refreshed");
  } catch (e) {
    next(e);
  }
};

module.exports.me = async (req, res, next) => {
  try {
    const user = await getMe(req.user.id);
    return sendSuccess(res, { user: formatUser(user) }, "Authenticated user fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await forgotPassword(req.body);
    return sendSuccess(res, attachDevOtp(null, result.devOtp), result.message);
  } catch (e) {
    next(e);
  }
};

module.exports.resendOtp = async (req, res, next) => {
  try {
    const purpose = req.body.purpose || "registration";
    const result = await resendOtp({ ...req.body, purpose });
    return sendSuccess(res, attachDevOtp(null, result.devOtp), result.message);
  } catch (e) {
    next(e);
  }
};

module.exports.verifyOtp = async (req, res, next) => {
  try {
    const purpose = req.body.purpose || "registration";
    const result = await verifyOtp({ ...req.body, purpose });

    if (purpose === "registration") {
      return sendSuccess(res, { user: formatUser(result.user) }, "Account verified successfully");
    }

    setResetCookie(res, result.resetToken);
    clearAuthCookies(res);

    return sendSuccess(res, null, "OTP verified. You can now reset your password.");
  } catch (e) {
    next(e);
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const { user, access_token_hash, refresh_token_hash } = await resetPassword({
      password: req.body.password,
      resetToken: req.cookies?.[RESET_COOKIE],
    });

    clearResetCookie(res);
    setAuthCookies(res, { access_token_hash, refresh_token_hash });

    return sendSuccess(res, { user: formatUser(user) }, "Password reset successfully");
  } catch (e) {
    next(e);
  }
};
