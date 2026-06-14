const AppError = require("../errors/AppError");

module.exports.notFound = (req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// errorHandler formats all AppError responses as { success: false, message }
