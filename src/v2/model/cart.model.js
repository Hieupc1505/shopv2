const { Schema, model, Types } = require('mongoose');

const cartModel = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'accounts',
        },
        status: {
            type: String,
            default: 'active',
            enum: ['active', 'deleted'],
        },
        modifyOn: {
            type: Date,
            defaule: Date.now,
        },
        count: Number,
        products: {
            type: Array,
            default: [],
        },
    },
    {
        collection: 'carts',
        timestamps: true,
    },
);

//Order model.
const orderSchema = new Schema(
    {
        orderId: {
            type: String,
            default: () => {
                return new Types.ObjectId().toString();
            },
            unique: true,
        },
        userId: String,
        shipping: Object,
        payment: Object,
        products: Array,
        status: Object,
    },
    {
        collection: 'orders',
        timestamps: true,
    },
);

//inventories model
const inventoriesSchema = new Schema(
    {
        productId: {
            type: String,
            default: () => {
                return new Types.ObjectId().toString();
            },
            unique: true,
            required: true,
        },
        selled: Number,
        quantity: {
            type: Number,
            required: true,
        }, //sẽ trừ sl trong reservation là số lượng sp đã được đặt hàng.
        reservations: Array,
        /*
            [
                {userId: 1, quantity: 10}
                {userId: 2, quantity: 20}
            ]
        */
        create_at: { type: Date, default: Date.now },
    },
    {
        collection: 'inventories',
        timestamps: true,
    },
);

module.exports = {
    _Cart: model('carts', cartModel),
    _Inventory: model('inventories', inventoriesSchema),
    _Order: model('orders', orderSchema),
};
