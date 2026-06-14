const Joi = require("joi");

const disputeStatuses = ["open", "under_review", "resolved"];

module.exports.create = Joi.object({
    booking_id: Joi.number().integer().positive().required(),
    reason: Joi.string().required(),
});

module.exports.resolve = Joi.object({
    status: Joi.string().valid(...disputeStatuses).required(),
    resolution_note: Joi.string().allow(null, ""),
});
