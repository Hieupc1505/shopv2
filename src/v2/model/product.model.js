const { Schema, model, Types } = require('mongoose');

//Product model
const productSchema = new Schema(
    {
        productId: {
            type: String,
        },
        code: String,
        price: {
            type: Number,
            min: 1000,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
        },
        description: String,
        release_date: {
            type: Date,
            default: Date.now,
        },
        rates: {
            type: Array,
            default: [],
        },
        images: {
            type: Array,
            required: true,
        },
        specs: {
            type: Array,
            default: [],
        },
        inventory: {
            type: Schema.Types.ObjectId,
            ref: 'inventories',
        },
    },
    {
        collection: 'products',
        timeseries: true,
    },
);

module.exports = {
    _Products: model('products', productSchema),
};
