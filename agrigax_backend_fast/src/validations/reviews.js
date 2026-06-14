const Joi = require("joi");

module.exports.create = Joi.object({
  listing_id: Joi.number().integer().positive(),
  listingId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow(null, ""),
}).or("listing_id", "listingId");

module.exports.update = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().allow(null, ""),
}).min(1);
