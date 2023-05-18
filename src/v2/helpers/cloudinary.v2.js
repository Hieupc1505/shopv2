const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const { CLOUDINARY_NAME, COULDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: COULDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});
// Cấu hình CloudinaryStorage
const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png'],
    params: {
        folder: 'shopv2',
        public_id: (req, file) => {
            const randomString = crypto.randomBytes(6).toString('hex');
            return `${file.originalname}-${randomString}`;
        },
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

function fileFilter(req, file, cb) {
    // Kiểm tra định dạng tệp tin
    if (!file.mimetype.match(/(jpg|jpeg|png)$/)) {
        return cb(new Error(`File ${file.originalname} không được hỗ trợ.`));
    }

    // Kiểm tra kích thước tệp tin
    cb(null, true);
}

// Tạo middleware
const uploadCloud = multer({
    storage,
    limits: { fileSize: 1024 * 1024 }, // giới hạn kích thước tệp tin tối đa là 2MB cho mỗi tệp tin
    fileFilter,
}).array('images', 5);

module.exports = {
    uploadCloud,
};
