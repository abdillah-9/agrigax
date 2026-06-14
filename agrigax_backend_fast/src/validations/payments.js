const Joi = require("joi");

const paymentStatuses = ["pending", "paid", "failed", "refunded"];

module.exports.create = Joi.object({
    booking_id: Joi.number().integer().positive().required(),
    receiver_id: Joi.number().integer().positive().required(),
    amount: Joi.number().precision(2).positive().required(),
    method: Joi.string().allow(null, ""),
    transaction_ref: Joi.string().allow(null, ""),
});

module.exports.updateStatus = Joi.object({
    status: Joi.string().valid(...paymentStatuses).required(),
});
