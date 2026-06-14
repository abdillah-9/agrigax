const Joi = require("joi");

module.exports.create = Joi.object({
    name: Joi.string().max(100).required(),
    slug: Joi.string().max(120).required(),
    description: Joi.string().allow(null, ""),
    is_active: Joi.boolean().default(true),
});

module.exports.update = Joi.object({
    name: Joi.string().max(100),
    slug: Joi.string().max(120),
    description: Joi.string().allow(null, ""),
    is_active: Joi.boolean(),
}).min(1);
