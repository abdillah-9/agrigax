const AppError = require("../errors/AppError");

const KNOWN_ERROR_STATUS = {
  "Invalid credentials": 401,
  "Invalid password": 401,
    "Account exists": 409,
    "Username is already taken": 409,
    "Phone number is already registered": 409,
    "Email is already registered": 409,
  "Not authorised": 401,
  "Please verify your account to continue": 403,
  "You do not have permission to perform this action": 403,
};

const formatJoiErrors = (err) => {
  const errors = {};

  for (const detail of err.details || []) {
    const key = detail.path?.length ? detail.path.join(".") : "body";

    if (!errors[key]) {
      errors[key] = [];
    }

    errors[key].push(detail.message);
  }

  return errors;
};

const resolveStatusCode = (err) => {
  if (err instanceof AppError || err.statusCode) {
    return err.statusCode;
  }

  if (err.isJoi) {
    return 400;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return 401;
  }

  if (err.code === "ER_DUP_ENTRY") {
    return 409;
  }

  if (KNOWN_ERROR_STATUS[err.message]) {
    return KNOWN_ERROR_STATUS[err.message];
  }

  return 500;
};

const resolveMessage = (err, statusCode) => {
  if (err.isJoi) {
    return err.details?.[0]?.message || "Validation failed";
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return "Invalid or expired token";
  }

  if (err.code === "ER_DUP_ENTRY") {
    return "Resource already exists";
  }

  if (statusCode === 500) {
    return "Internal server error";
  }

  return err.message || "Something went wrong";
};

module.exports.errorHandler = (err, req, res, next) => {
  const statusCode = resolveStatusCode(err);
  const message = resolveMessage(err, statusCode);

  const payload = {
    success: false,
    message,
  };

  if (err.isJoi) {
    payload.errors = formatJoiErrors(err);
  } else if (err.errors) {
    payload.errors = err.errors;
  }

  return res.status(statusCode).json(payload);
};
