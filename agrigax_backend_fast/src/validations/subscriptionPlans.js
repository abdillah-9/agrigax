const Joi = require("joi");

// features = boolean capability flags, limits = numeric quotas — kept as two
// separate, differently-typed objects rather than one mixed object (§4.1, BR-008/BR-009).
const features = Joi.object().pattern(Joi.string(), Joi.boolean());
const limits = Joi.object().pattern(Joi.string(), Joi.number());

module.exports.create = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().required(),
  price: Joi.number().precision(2).min(0).required(),
  currency: Joi.string().max(10).required(),
  duration_days: Joi.number().integer().positive().required(),
  features: features.required(),
  limits: limits.required(),
  is_default_vendor_plan: Joi.boolean().default(false),
  is_active: Joi.boolean().default(true),
});

module.exports.update = Joi.object({
  name: Joi.string().max(100),
  description: Joi.string(),
  price: Joi.number().precision(2).min(0),
  currency: Joi.string().max(10),
  duration_days: Joi.number().integer().positive(),
  features,
  limits,
  is_default_vendor_plan: Joi.boolean(),
  is_active: Joi.boolean(),
}).min(1);
