const AppError = require("../errors/AppError");

module.exports.requireVerified = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Not authorised", 401));
  }

  if (!req.user.is_verified) {
    return next(new AppError("Please verify your account to continue", 403));
  }

  return next();
};
