const router = require('express').Router();
const { addToCart, removeToCart, paymentOnl, paymentResult } = require('@v2/controllers/cart.controller');

router.route('/add').post(addToCart);
router.route('/delete').delete(removeToCart);
router.route('/payment').post(paymentOnl);
router.route('/payment_return/:keycode').get(paymentResult);

module.exports = router;
