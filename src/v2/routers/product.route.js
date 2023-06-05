const router = require('express').Router();
const {
    add,
    read,
    update,
    deleteP,
    searchProductName,
    sortProduct,
    getProdcuts,
    suggestSearchName,
} = require('@v2/controllers/product.controller');

router.get('/test', (req, res, next) => {
    res.status(200).json({
        success: true,
        message: '/api/v2/pds is ready!!!',
    });
});

//router for admin
router.route('/add').post(add);
router.route('/read').post(read);
router.route('/update').patch(update);
router.route('/update').post(deleteP);

//router for user
router.route('/products').get(getProdcuts);

//router for client
router.route('/search').get(suggestSearchName);
router.route('/search/list').get(searchProductName);
router.route('/sort').get(sortProduct);

module.exports = router;
