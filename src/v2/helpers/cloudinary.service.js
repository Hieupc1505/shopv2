require('dotenv').config();
const createError = require('http-errors');
const { uploadImagesSequentially } = require('@v2/utils');
const { cloudinary } = require('@v2/configs/cloudinary.config');

const {
    validImg,
    common: { randomString },
} = require('@v2/utils/index');

var that = (module.exports = {
    uploadImgBase64: async (req, res, next) => {
        try {
            if (req.contentType === 'json') {
                const { images } = req.body;
                const [errors, data] = validImg(images);
                if (!!errors.length) {
                    throw new createError.BadRequest(errors);
                }

                const result = await uploadImagesSequentially(data, cloudinary)
                    .then((result) => result)
                    .catch(next);
                req.body.images = result;
                next();
            } else next();
        } catch (err) {
            // console.log(err);
            next(err);
        }
    },
});
