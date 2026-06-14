const Joi = require("joi");

const roles = ["customer", "provider", "admin"];
const otpPurposes = ["registration", "password_reset"];

const usernamePattern = /^[a-zA-Z0-9._-]{3,30}$/;
const phonePattern = /^\+?[0-9]{10,15}$/;

module.exports.login = Joi.object({
  identifier: Joi.string().required().messages({
    "any.required": "Username, phone, or email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Password must be filled",
    "string.min": "Password must have at least 6 characters",
  }),
});

module.exports.register = Joi.object({
  username: Joi.string().pattern(usernamePattern).required().messages({
    "string.pattern.base": "Username must be 3-30 characters (letters, numbers, . _ -)",
    "any.required": "Username is required",
  }),
  fullName: Joi.string().max(100),
  full_name: Joi.string().max(100),
  phone: Joi.string().pattern(phonePattern).required().messages({
    "string.pattern.base": "Please provide a valid phone number",
    "any.required": "Phone number is required",
  }),
  email: Joi.string().email().max(100).allow(null, ""),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...roles),
  active_role: Joi.string().valid(...roles),
}).or("fullName", "full_name");

module.exports.forgotPassword = Joi.object({
  identifier: Joi.string().required().messages({
    "any.required": "Username, phone, or email is required",
  }),
});

module.exports.verifyOtp = Joi.object({
  phone: Joi.string().pattern(phonePattern).required(),
  otp: Joi.string().length(6).required(),
  purpose: Joi.string().valid(...otpPurposes).default("registration"),
});

module.exports.resetPassword = Joi.object({
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords must match",
  }),
});

module.exports.resendOtp = Joi.object({
  phone: Joi.string().pattern(phonePattern).required(),
  purpose: Joi.string().valid(...otpPurposes).default("registration"),
});

module.exports.signIn = module.exports.login;
module.exports.signUp = module.exports.register;
