const AppError = require("../errors/AppError");

module.exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorised", 401));
    }

    if (!roles.includes(req.user.active_role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }

    return next();
  };
};
