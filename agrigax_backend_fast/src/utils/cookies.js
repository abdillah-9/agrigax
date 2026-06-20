const ACCESS_COOKIE = "access_token_hash";
const REFRESH_COOKIE = "refresh_token_hash";
const RESET_COOKIE = "password_reset_verified";

const getCookieBase = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const crossOrigin =
    process.env.CROSS_ORIGIN_COOKIES === "true" ||
    (process.env.FRONTEND_URL && process.env.FRONTEND_URL.startsWith("https://"));

  // Cross-origin credentialed requests (Netlify -> localhost, or :5173 -> :4000)
  // require SameSite=None. Chrome allows Secure cookies on localhost over HTTP.
  if (!isProduction || crossOrigin) {
    return { sameSite: "none", secure: true };
  }

  return { sameSite: "lax", secure: true };
};

module.exports.ACCESS_COOKIE = ACCESS_COOKIE;
module.exports.REFRESH_COOKIE = REFRESH_COOKIE;
module.exports.RESET_COOKIE = RESET_COOKIE;

module.exports.setAuthCookies = (res, { access_token_hash, refresh_token_hash }) => {
  const cookieBase = getCookieBase();

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
  const cookieBase = getCookieBase();

  res.clearCookie(ACCESS_COOKIE, cookieBase);
  res.clearCookie(REFRESH_COOKIE, cookieBase);
};

module.exports.setResetCookie = (res, token) => {
  const cookieBase = getCookieBase();

  res.cookie(RESET_COOKIE, token, {
    ...cookieBase,
    httpOnly: true,
    maxAge: 1000 * 60 * 15,
  });
};

module.exports.clearResetCookie = (res) => {
  const cookieBase = getCookieBase();

  res.clearCookie(RESET_COOKIE, cookieBase);
};
