const Joi = require("joi");

const phonePattern = /^\+?[0-9]{10,15}$/;

module.exports.updateProfile = Joi.object({
  fullName: Joi.string().max(100),
  full_name: Joi.string().max(100),
  phone: Joi.string().pattern(phonePattern),
  avatar: Joi.string().uri().allow(null, ""),
}).min(1);

module.exports.updateSettings = Joi.object({
  email: Joi.string().email().max(100),
  phone: Joi.string().max(20).allow(null, ""),
}).min(1);
