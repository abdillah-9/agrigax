const Joi = require("joi");

const listingTypes = ["service", "product", "worker", "equipment", "livestock"];

module.exports.create = Joi.object({
  title: Joi.string().max(150).required(),
  description: Joi.string().required(),
  type: Joi.string().valid(...listingTypes).required(),
  category_id: Joi.number().integer().positive().required(),
  categoryId: Joi.number().integer().positive(),
  location: Joi.string().max(255).required(),
  price: Joi.number().precision(2).min(0).default(0),
  is_available: Joi.boolean().default(true),
  isAvailable: Joi.boolean(),
  images: Joi.array().items(Joi.string().uri()).max(10).default([]),
}).or("category_id", "categoryId");

module.exports.update = Joi.object({
  title: Joi.string().max(150),
  description: Joi.string(),
  type: Joi.string().valid(...listingTypes),
  category_id: Joi.number().integer().positive(),
  categoryId: Joi.number().integer().positive(),
  location: Joi.string().max(255),
  price: Joi.number().precision(2).min(0),
  is_available: Joi.boolean(),
  isAvailable: Joi.boolean(),
  images: Joi.array().items(Joi.string().uri()).max(10),
}).min(1);
