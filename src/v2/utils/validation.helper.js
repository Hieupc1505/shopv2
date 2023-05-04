const Joi = require('./joi.init');

const userValidate = (data) => {
    const userSchema = Joi.object({
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(5).max(32).required(),
    });

    const emailSchema = Joi.object({
        email: Joi.string().email().lowercase().required(),
    });
    return data?.password ? userSchema.validate(data) : emailSchema.validate(data);
};

module.exports = {
    userValidate,
};
