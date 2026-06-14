const ACCESS_COOKIE = "access_token_hash";
const REFRESH_COOKIE = "refresh_token_hash";
const RESET_COOKIE = "password_reset_verified";

const cookieBase = {
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

module.exports.ACCESS_COOKIE = ACCESS_COOKIE;
module.exports.REFRESH_COOKIE = REFRESH_COOKIE;
module.exports.RESET_COOKIE = RESET_COOKIE;

module.exports.setAuthCookies = (res, { access_token_hash, refresh_token_hash }) => {
  res.cookie(ACCESS_COOKIE, access_token_hash, {
    ...cookieBase,
    httpOnly: true,
    maxAge: 1000 * 60 * 15,
  });

  res.cookie(REFRESH_COOKIE, refresh_token_hash, {
    ...cookieBase,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

module.exports.clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE, cookieBase);
  res.clearCookie(REFRESH_COOKIE, cookieBase);
};

module.exports.setResetCookie = (res, token) => {
  res.cookie(RESET_COOKIE, token, {
    ...cookieBase,
    httpOnly: true,
    maxAge: 1000 * 60 * 15,
  });
};

module.exports.clearResetCookie = (res) => {
  res.clearCookie(RESET_COOKIE, cookieBase);
};
