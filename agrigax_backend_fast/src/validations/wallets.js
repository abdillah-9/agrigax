const Joi = require("joi");

module.exports.deposit = Joi.object({
  amount: Joi.number().precision(2).positive().required(),
  method: Joi.string().required(),
  phone: Joi.string().required(),
  reference: Joi.string().allow(null, ""),
  description: Joi.string().allow(null, ""),
});

module.exports.withdraw = Joi.object({
  amount: Joi.number().precision(2).positive().required(),
  method: Joi.string().required(),
  phone: Joi.string().required(),
  reference: Joi.string().allow(null, ""),
  description: Joi.string().allow(null, ""),
});
