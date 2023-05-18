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
    addToCart: async ({ productId = null, userId = null, quantity, status = 'active' }) => {
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
    removeToCart: async ({ productId = null, userId = null }) => {
        if (!productId || !userId) throw new createError.BadRequest();

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
        console.log(check.length);
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
    paymentOnl: async (
        {
            userId,
            productId,
            weight,
            address,
            number,
            amount,
            keyCode,
            shipping,
            status = 0,
            notes,
            type,
            pay = 'pending',
        },
        url,
    ) => {
        const { error } = cartValid({
            userId,
            productId,
            weight: +weight,
            address,
            number,
            amount: +amount,
            shipping,
            status: +status,
            notes,
            type,
            pay,
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
});
