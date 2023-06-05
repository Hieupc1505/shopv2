const { _Cart, _Inventory, _Order } = require('@v2/model/cart.model');
const createError = require('http-errors');
const { _Products } = require('@v2/model/product.model');
const { _User } = require('@v2/model/user.model');
const client = require('@v2/configs/redis.config');

const {
    common: { randomString, encodeBase64, decodeBase64ToUTF8 },
    validateData: { cartValid },
    errorJoi: handleJoiError,
    updateInventories,
} = require('@v2/utils/index');
const handleInventories = require('@v2/utils/handleInventories');

var that = (module.exports = {
    addToCart: async ({ productId = null, quantity, status = 'active' }, userId = null) => {
        if (!productId || !userId) throw new createError.BadRequest();

        const checkProduct = await Promise.all([_Products.findOne({ productId }), _User.findOne({ _id: userId })]);
        console.log('add2');
        if (checkProduct.includes(null)) throw new createError.BadRequest();

        const isExist = await _Cart.findOne({
            userId,
            'products.productId': productId,
        });
        if (isExist) throw new createError.BadRequest('Sản phẩm đã tồn tại trong giỏ hàng');

        await _Cart.findOneAndUpdate(
            {
                userId,
            },
            {
                $push: {
                    products: {
                        productId,
                        quantity,
                    },
                },
                $setOnInsert: {
                    userId,
                    status,
                },
            },
            { upsert: true, new: true },
        );

        return {
            success: true,
            message: 'Thêm thành công!!',
        };
    },
    removeToCart: async ({ productId }, userId = null) => {
        if (!productId || !userId) throw new createError.BadRequest('productId,userId ');

        const arrCheck = productId.split('|').map((item) => {
            return _Cart.findOne({ userId, 'products.productId': item });
        });

        const checkPro = await Promise.all(arrCheck);

        if (checkPro.includes(null)) {
            throw new createError.BadRequest('Sản phẩm không có trong giỏ hàng');
        }

        await _Cart.findOneAndUpdate(
            { userId, 'products.productId': { $in: productId.split(/\||\s|-|,/) } },
            { $pull: { products: { productId: { $in: productId.split(/\||\s|-|,/) } } } },
            { multi: true },
        );

        return {
            success: true,
            message: 'Xóa thành công!!',
        };
    },
    paymentResult: async ({ vnp_ResponseCode, isVerify }, keycode) => {
        if (!isVerify) throw new createError.Forbidden();

        let isExist = await client.exists(keycode);
        if (isExist === 0) throw new createError.Forbidden();

        const data = decodeBase64ToUTF8(await client.get(keycode));

        data.products = decodeBase64ToUTF8(data?.products);

        if (vnp_ResponseCode === '00') {
            data.payment.vnp_Code = vnp_ResponseCode;
            data.payment.status = 'fullfill';
        } else {
            data.payment.vnp_Code = vnp_ResponseCode;
            data.payment.status = 'rejected';
        }

        const prds = data.products.map(({ productId }) => productId);

        const check = await _Products.find({ productId: { $in: prds } });

        if (check.length !== prds.length) throw new createError.BadRequest();
        const [result, _] = await Promise.all([
            _Order.create(data),
            client.del(keycode),
            _Cart.findOneAndUpdate(
                { userId: data.userId, 'products.productId': { $in: prds } },
                { $pull: { products: { productId: { $in: prds } } } },
                { multi: true },
            ),
            ...handleInventories(data?.products, data?.userId),
        ]);

        return {
            success: true,
            result,
        };
    },
    paymentCOD: async (
        { productId, weight, address, number, amount, shipping, status, notes, type, pay, name },
        userId,
    ) => {
        const { error } = cartValid({
            userId,
            productId,
            weight: +weight,
            address,
            number: +number,
            amount: +amount,
            shipping,
            status: +status,
            notes,
            type,
            pay,
            name,
        });

        if (error) {
            throw new createError.BadRequest(handleJoiError(error));
        }

        const parseProducts = decodeBase64ToUTF8(productId);
        const prds = parseProducts.map(({ productId }) => productId);

        const check = await _Products.find({ productId: { $in: prds } });
        if (check.length !== prds.length) throw new createError.BadRequest();

        let data = {
            userId,
            shipping: {
                address, //địa chỉ giao hàng
                number, //sđt giao hàng
                cost: shipping, //phí ship
                status, //tình trạng ship đã giao hay chưa
                notes, //ghi chú thêm
                weight, //đơn vị gram
                name,
            },
            payment: {
                type: 'cod', //cod
                total: amount, // bao gồm cả ship
                status: 'pending', //tình trạng thanh toán
                timmer: Date.now(),
            },
            products: parseProducts,
        };

        const [result, _] = await Promise.all([
            _Order.create(data),
            _Cart.findOneAndUpdate(
                { userId, 'products.productId': { $in: prds } },
                { $pull: { products: { productId: { $in: prds } } } },
                { multi: true },
            ),
            ...handleInventories(parseProducts, userId),
        ]);
        return {
            success: true,
            result,
        };
    },
    paymentOnl: async (
        {
            name,
            productId,
            keyCode,
            weight,
            address,
            number,
            amount,
            shipping,
            status = 0,
            notes,
            type = 'banking',
            pay = 'pending',
        },
        userId,
        url,
    ) => {
        const { error } = cartValid({
            userId,
            productId,
            weight: +weight,
            address,
            number: +number,
            amount: +amount,
            shipping,
            status: +status,
            notes,
            type,
            pay,
            name,
        });

        if (error) {
            throw new createError.BadRequest(handleJoiError(error));
        }

        let data = encodeBase64({
            userId,
            shipping: {
                address, //địa chỉ giao hàng
                number, //sđt giao hàng
                cost: shipping, //phí ship
                status, //tình trạng ship đã giao hay chưa
                notes, //ghi chú thêm
                weight, //đơn vị gram
                name,
            },
            payment: {
                type, //cod
                total: amount, // bao gồm cả ship
                status: pay, //tình trạng thanh toán
                timmer: Date.now(),
            },
            products: productId,
        });

        await client.set(keyCode, data, 'EX', 15 * 60);

        return {
            success: true,
            url: url,
            keyCode,
            data,
        };
    },
    getCart: async (userId) => {
        const cart = await _Cart.findOne({ userId }).lean();

        return {
            success: true,
            data: cart,
        };
    },
    getDetailCart: async (userId) => {
        const cart = (await _Cart.findOne({ userId }).lean()).products;
        const listProductId = cart.map((item) => item.productId);
        const result = await _Products
            .find({
                productId: { $in: listProductId },
            })
            .lean();
        return {
            success: true,
            data: result.map((item, index) => ({ ...item, ...cart[index] })),
        };
    },
});
