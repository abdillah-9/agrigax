const Joi = require("joi");

// url is a path served by the frontend (e.g. /catalog/maize.svg), so relative
// values must be allowed.
const urlField = Joi.string().max(500).pattern(/^(\/|https?:\/\/)/).messages({
  "string.pattern.base": "url must be an absolute URL or a path starting with /",
});

module.exports.createImage = Joi.object({
  name: Joi.string().max(100).required(),
  keywords: Joi.string().max(255).allow(null, ""),
  category_id: Joi.number().integer().positive().allow(null),
  categoryId: Joi.number().integer().positive().allow(null),
  url: urlField.required(),
  is_active: Joi.boolean(),
  isActive: Joi.boolean(),
});

module.exports.updateImage = Joi.object({
  name: Joi.string().max(100),
  keywords: Joi.string().max(255).allow(null, ""),
  category_id: Joi.number().integer().positive().allow(null),
  categoryId: Joi.number().integer().positive().allow(null),
  url: urlField,
  is_active: Joi.boolean(),
  isActive: Joi.boolean(),
}).min(1);

module.exports.requestImage = Joi.object({
  term: Joi.string().max(150).required(),
});

module.exports.resolveRequest = Joi.object({
  status: Joi.string().valid("pending", "added", "dismissed").required(),
});
