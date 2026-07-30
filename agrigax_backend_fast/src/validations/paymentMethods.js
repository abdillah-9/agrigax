const Joi = require("joi");

const types = ["mobile_money", "bank_account", "other"];

module.exports.create = Joi.object({
  name: Joi.string().max(100).required(),
  type: Joi.string().valid(...types).required(),
  account_name: Joi.string().max(150).allow(null, ""),
  account_number: Joi.string().max(100).allow(null, ""),
  phone_number: Joi.string().max(20).allow(null, ""),
  instructions: Joi.string().allow(null, ""),
  display_order: Joi.number().integer().min(0).default(0),
  is_active: Joi.boolean().default(true),
});

module.exports.update = Joi.object({
  name: Joi.string().max(100),
  type: Joi.string().valid(...types),
  account_name: Joi.string().max(150).allow(null, ""),
  account_number: Joi.string().max(100).allow(null, ""),
  phone_number: Joi.string().max(20).allow(null, ""),
  instructions: Joi.string().allow(null, ""),
  display_order: Joi.number().integer().min(0),
  is_active: Joi.boolean(),
}).min(1);
