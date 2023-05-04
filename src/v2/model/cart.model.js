const { Schema, model } = require("mongoose");

const cartModel = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "accounts",
        },
        status: {
            type: String,
            default: "active",
            enum: ["active", "deleted"],
        },
        modifyOn: {
            type: Date,
            defaule: Date.now,
        },
        products: {
            type: Array,
            default: [],
        },
    },
    {
        collection: carts,
        timestamps: true,
    }
);

module.exports = { _Cart: model("carts", cartModel) };
