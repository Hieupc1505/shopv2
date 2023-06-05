const {
    addToCart,
    removeToCart,
    paymentResult,
    paymentOnl,
    getCart,
    getDetailCart,
    paymentCOD,
} = require('@v2/services/cart.service');
const { catchAsync } = require('@v2/utils/index');
const {
    paymentVNP: { createVpnUrl, verifyReturnURL },
} = require('@v2/middleware/index.middeware');
const {
    authToken: { authAdmin, authToken },
} = require('@v2/middleware/index.middeware');
var that = (module.exports = {
    addToCart: [
        authToken,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await addToCart(req.body, req.userId));
        }),
    ],
    removeToCart: [
        authToken,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await removeToCart(req.body, req.userId));
        }),
    ],
    paymentOnl: [
        authToken,
        createVpnUrl,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await paymentOnl(req.body, req.userId, req.url));
        }),
    ],
    paymentResult: [
        verifyReturnURL,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await paymentResult(req.query, req.params.keycode));
        }),
    ],
    getCart: [
        authToken,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await getCart(req.userId));
        }),
    ],
    getDetailCart: [
        authToken,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await getDetailCart(req.userId));
        }),
    ],
    paymentCOD: [
        authToken,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await paymentCOD(req.body, req.userId));
        }),
    ],
});
