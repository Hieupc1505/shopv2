const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { CLOUDINARY_NAME, COULDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: COULDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const {
    common: { randomString },
} = require('@v2/utils/index');
// Cấu hình CloudinaryStorage
const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png', 'webp'],
    params: {
        folder: 'shopv2',
        public_id: (req, file) => {
            const str = randomString(6);
            file.originalname = file.originalname.replace(/(\.jpg|\.jpeg|\.png|\.webp)$/, '-');
            return `${file.originalname}${str}`;
        },
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

module.exports = {
    storage,
    cloudinary,
};
