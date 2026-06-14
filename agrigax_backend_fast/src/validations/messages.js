const Joi = require("joi");

module.exports.createConversation = Joi.object({
  user_two_id: Joi.number().integer().positive(),
  userTwoId: Joi.number().integer().positive(),
  listing_id: Joi.number().integer().positive().allow(null),
  listingId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()).allow(null),
}).or("user_two_id", "userTwoId");

module.exports.send = Joi.object({
  message: Joi.string(),
  text: Joi.string(),
}).or("message", "text");
