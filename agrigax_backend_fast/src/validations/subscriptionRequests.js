const Joi = require("joi");

module.exports.create = Joi.object({
  plan_id: Joi.number().integer().positive(),
  planId: Joi.number().integer().positive(),
  payment_method: Joi.number().integer().positive(),
  paymentMethodId: Joi.number().integer().positive(),
  amount: Joi.number().precision(2).positive().required(),
  transaction_reference: Joi.string().max(150),
  transactionReference: Joi.string().max(150),
  receipt_url: Joi.string().max(500).allow(null, ""),
  receiptUrl: Joi.string().max(500).allow(null, ""),
  notes: Joi.string().allow(null, ""),
})
  .or("plan_id", "planId")
  .or("payment_method", "paymentMethodId")
  .or("transaction_reference", "transactionReference");

module.exports.reject = Joi.object({
  comment: Joi.string().allow(null, ""),
});
