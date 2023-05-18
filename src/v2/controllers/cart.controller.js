const { addToCart, removeToCart, paymentResult, paymentOnl } = require('@v2/services/cart.service');
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
            res.status(200).json(await addToCart(req.body));
        }),
    ],
    removeToCart: [
        authToken,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await removeToCart(req.body));
        }),
    ],
    paymentOnl: [
        authToken,
        createVpnUrl,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await paymentOnl(req.body, req.url));
        }),
    ],
    paymentResult: [
        verifyReturnURL,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await paymentResult(req.query, req.params.keycode));
        }),
    ],
});
