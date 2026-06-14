const Joi = require("joi");

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
