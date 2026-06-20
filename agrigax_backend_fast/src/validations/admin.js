const Joi = require("joi");

const roles = ["customer", "provider", "admin"];
const paymentStatuses = ["pending", "paid", "completed", "failed", "refunded"];
const transactionTypes = ["credit", "debit"];

module.exports.listQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  status: Joi.string(),
  role: Joi.string().valid(...roles),
  suspended: Joi.alternatives().try(Joi.boolean(), Joi.string().valid("true", "false")),
  search: Joi.string().allow(""),
  type: Joi.string().valid(...transactionTypes),
});

module.exports.suspendUser = Joi.object({
    reason: Joi.string().allow(null, ""),
});

module.exports.updateSetting = Joi.object({
    value: Joi.string().required(),
    description: Joi.string().allow(null, ""),
});

module.exports.createAnnouncement = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
});

module.exports.createFaq = Joi.object({
    question: Joi.string().required(),
    answer: Joi.string().required(),
});

module.exports.featureListing = Joi.object({
    listing_id: Joi.number().integer().positive().required(),
});
