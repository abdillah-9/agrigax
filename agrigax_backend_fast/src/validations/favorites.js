const Joi = require("joi");

module.exports.toggle = Joi.object({
    listing_id: Joi.number().integer().positive().required(),
});
