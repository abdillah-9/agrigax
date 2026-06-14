const Joi = require("joi");

module.exports.create = Joi.object({
  listing_id: Joi.number().integer().positive(),
  listingId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()),
  scheduled_at: Joi.date().iso(),
  date: Joi.date().iso(),
  notes: Joi.string().allow(null, ""),
}).or("listing_id", "listingId");

module.exports.createDispute = Joi.object({
  booking_id: Joi.number().integer().positive(),
  bookingId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()),
  reason: Joi.string().required(),
}).or("booking_id", "bookingId");

module.exports.resolveDispute = Joi.object({
  status: Joi.string().valid("under_review", "resolved").required(),
  resolution_note: Joi.string().allow(null, ""),
  resolutionNote: Joi.string().allow(null, ""),
});
