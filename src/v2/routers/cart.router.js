const router = require('express').Router();
const {
    addToCart,
    removeToCart,
    paymentOnl,
    paymentResult,
    getCart,
    getDetailCart,
    paymentCOD,
} = require('@v2/controllers/cart.controller');

router.route('/add').post(addToCart);
router.route('/delete').delete(removeToCart);
router.route('/payment/banking').post(paymentOnl);
router.route('/payment/cod').post(paymentCOD);
router.route('/payment_return/:keycode').get(paymentResult);
router.route('/all').get(getCart);
router.route('/detail').get(getDetailCart);

module.exports = router;
