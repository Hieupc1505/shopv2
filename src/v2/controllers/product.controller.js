const { catchAsync } = require('@v2/utils/index');

const {
    authToken: { authAdmin, authToken },
    cloudinary: { uploadHandler },
    fillterTypeReq,
    paymentVNP,
} = require('@v2/middleware/index.middeware');

const {
    add,
    read,
    update,
    deleteP,
    searchProductName,
    sortProduct,
    getProdcuts,
    suggestSearchName,
} = require('@v2/services/product.service');
const { uploadImgBase64 } = require('@v2/helpers/cloudinary.service');

var that = (module.exports = {
    //poublic route
    getProdcuts: catchAsync(async (req, res, next) => {
        res.status(200).json(await getProdcuts(req.query));
    }),

    //private route
    add: [
        authAdmin,
        fillterTypeReq,
        uploadHandler,
        uploadImgBase64,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await add(req.body));
        }),
    ],

    read: catchAsync(async (req, res, next) => {
        res.status(200).json(await read(req.body));
    }),
    update: [
        authAdmin,
        uploadHandler,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await update(req.body));
        }),
    ],
    deleteP: [
        authAdmin,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await deleteP(req.body));
        }),
    ],

    //client side
    searchProductName: catchAsync(async (req, res, next) => {
        res.status(200).json(await searchProductName(req.query, req.params.keycode));
    }),

    sortProduct: catchAsync(async (req, res, next) => {
        res.status(200).json(await sortProduct(req.query));
    }),
    suggestSearchName: catchAsync(async (req, res, next) => {
        res.status(200).json(await suggestSearchName(req.query));
    }),
});
