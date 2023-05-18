require('dotenv').config();
const createError = require('http-errors');

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
                let imgArr = data.map(([filename, base64String]) => {
                    return cloudinary.uploader.upload(base64String, {
                        public_id: `${filename}${randomString(6)}`,
                        folder: 'shopv2',
                    });
                });
                console.log('before promise');
                await Promise.all(imgArr)
                    .then((resp) => {
                        let newData = resp.map((item) => {
                            return { filename: item.public_id, path: item.url };
                        });

                        return newData;
                    })
                    .then((data) => {
                        req.body.images = data;
                        console.log('image tt');
                        next();
                    })
                    .catch((err) => {
                        console.log('err');
                        next(err);
                    });
            } else next();
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
});
