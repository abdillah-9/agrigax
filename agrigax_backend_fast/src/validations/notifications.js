const Joi = require("joi");

const notificationTypes = ["booking", "payment", "message", "system", "promotion"];

module.exports.create = Joi.object({
    user_id: Joi.number().integer().positive().required(),
    title: Joi.string().required(),
    body: Joi.string().required(),
    type: Joi.string().valid(...notificationTypes).default("system"),
});
