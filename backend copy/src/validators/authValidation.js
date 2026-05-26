const Joi = require('joi');

module.exports.signInValidation = ()=>{
    Joi.object({
        email: Joi.string().email().required().messages({
            "string.email":"Please use correct email format",
            "any.required":"Email is required",
        }),
        password: required().min(6).max(12).messages({
            "any.required":"Password must be filled",
            "string.min":"Password must have atleast 6 characters",
            "string.max":"Password cannot have more than 12 characters",
        })
    })
}