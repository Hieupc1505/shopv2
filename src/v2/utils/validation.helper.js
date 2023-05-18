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

const prodValidate = (data) => {
    const prodSchema = Joi.object({
        productId: Joi.string().lowercase().required(),
        code: Joi.string(),
        price: Joi.number().min(100).required(),
        name: Joi.string().required(),
        description: Joi.string(),
        specs: Joi.array(),
        images: Joi.array().required(),
        quantity: Joi.number().required(),
    });
    return prodSchema.validate(data);
};
// { userId, productId, address, number, amount, keyCode, shipping, status = 0, notes, type, status = 'pending' }
const cartValid = (data) => {
    const cartSchema = Joi.object({
        userId: Joi.string().required(),
        productId: Joi.string().required(),
        address: Joi.string().required(),
        number: Joi.string().length(10).required(),
        amount: Joi.number().min(1000).max(10000000).required(),
        shipping: Joi.number().required(),
        weight: Joi.number().min(100).required(),
        status: Joi.number().valid(-1, 0, 1).required(), //tình trạng giao hàng
        notes: Joi.string(),
        type: Joi.string().required(),
        pay: Joi.string().valid('pending', 'fullfill', 'rejected'),
    });
    return cartSchema.validate(data);
};

module.exports = {
    userValidate,
    prodValidate,
    cartValid,
};
