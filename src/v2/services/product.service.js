const { _Products } = require('@v2/model/product.model');
const { _Inventory } = require('@v2/model/cart.model');
const {
    validateData: { prodValidate },
    errorJoi: handleJoiError,
    cloudinary: { removeImg },
} = require('@v2/utils/index');
const createError = require('http-errors');
const { integrations } = require('googleapis/build/src/apis/integrations');
const { ids } = require('googleapis/build/src/apis/ids');

const sortBy = async (keyFind = [], keySort = {}) => {
    const defaultFind = !keyFind.length ? [{ price: { $gte: 0, $lt: 100000000 } }] : [];
    const finalFind = defaultFind.concat(keyFind);
    console.log(keySort);
    let query = await _Products
        .find({
            $and: finalFind,
        })
        .populate({ path: 'inventory', select: 'selled' })
        .exec();

    return !!keySort?.inventory
        ? query.sort((a, b) => keySort.inventory)
        : query.sort((a, b) => Object.values(keySort));
};

var that = (module.exports = {
    add: async ({ code, price, name, brand = null, description, specs = [], images, quantity }) => {
        const { errors } = prodValidate({ code, price, name, brand, description, specs, images });
        if (errors) {
            throw new createError.BadRequest(handleJoiError(errors));
        }

        const ivt = await _Inventory.create({
            selled: 0,
            quantity,
            reservations: [],
        });

        const prod = new _Products({
            code,
            price,
            name,
            brand,
            description,
            specs,
            images,
            productId: ivt.productId,
            inventory: ivt._id,
        });
        let result = await prod.save();
        return {
            success: true,
            mesage: 'Thêm thành công',
            elements: result,
            ivt,
        };
    },
    update: async ({
        code = null,
        price = null,
        name = null,
        brand = null,
        description = null,
        specs = null,
        images = null,
        productId,
    }) => {
        let data = { code, price, name, brand, description, specs, images };
        const filterObj = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== null));
        let query = await _Products.findOne({ productId });
        if (!query) {
            throw new createError.BadRequest('ProductId not found');
        }
        if (images?.length) {
            await Promise.all(query.images.map(({ filename }) => removeImg(filename)));
        }

        await _Products.updateOne(
            { productId },
            {
                $set: filterObj,
            },
        );
        return {
            success: true,
            message: `Cập nhâp ${productId} thàng công`,
        };
    },
    deleteP: async ({ productId }) => {
        if (!productId) throw new createError.BadRequest('ProductId is required!!');
        const Ids = productId.split(/\||\s|-|,/);
        const find = await _Products.find({ productId: { $in: Ids } });

        if (find.length !== Ids.length) throw new createError.BadRequest();
        await _Products.deleteMany({ productId: { $in: Ids } });

        return {
            success: true,
            message: 'Xóa thành công!!',
            find,
        };
    },
    read: async ({ productId = null }) => {
        if (!productId) throw new createError.BadRequest('ProductId is required!!');
        const Ids = productId.split(/\||\s|-|,/);
        const q = await _Products.find({ productId: { $in: Ids } });

        return {
            success: true,
            data: {
                query: q,
            },
        };
    },
    searchProductName: async ({ key = null }) => {
        if (!key)
            return {
                success: true,
                data: {},
            };

        const q = await _Products
            .find({
                $text: { $search: key },
            })
            .lean();

        return {
            success: true,
            data: q,
        };
    },
    sortProduct: async ({ min, max, price = null, bestSell = null, rate = null }) => {
        //ASC -> cao - thấp.
        //DESC -> thấp -> cao.
        //khoảng giá

        let check = { price, inventory: bestSell, rate };
        const shortby = Object.keys(check)
            .filter((item) => Boolean(check[item]))
            .map((item) => ({ [item]: +check[item] }));

        if (shortby.length !== 1) throw new createError.BadRequest();

        if (!!min || !!max) {
            return await sortBy({ price: { $gt: min, $lt: max || 10000000 } }, shortby[0]);
        }

        const result = await sortBy([], shortby[0]);

        return {
            success: true,
            data: result,
        };
    },
});
