const Joi = require("joi");

const defaultOptions = {
    abortEarly: false,
};

module.exports = Joi.defaults((schema) => schema.options(defaultOptions));
