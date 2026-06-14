const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");
const { ACCESS_COOKIE } = require("../utils/cookies");
const { getUserById } = require("../repositories/auth");

module.exports.authenticate = async (req, res, next) => {
  const access_token_hash = req.cookies?.[ACCESS_COOKIE];

  if (!access_token_hash) {
    return next(new AppError("Not authorised", 401));
  }

  try {
    const payload = jwt.verify(access_token_hash, process.env.ACCESS_SECRET_KEY);
    const user = await getUserById(payload.id);

    if (!user || user.is_suspended) {
      return next(new AppError("Not authorised", 401));
    }

    req.user = user;
    return next();
  } catch (e) {
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return next(new AppError("Not authorised", 401));
    }

    return next(e);
  }
};
