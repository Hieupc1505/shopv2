const createError = require('http-errors');
const multer = require('multer');
const { storage } = require('@v2/configs/cloudinary.config');
const {
    cloudinary: { fileFilter },
} = require('@v2/utils/index');

// Tạo middleware
const uploadCloud = multer({
    storage,
    limits: { fileSize: 1024 * 1024 }, // giới hạn kích thước tệp tin tối đa là 2MB cho mỗi tệp tin
    fileFilter,
}).array('images', 5);

function uploadHandler(req, res, next) {
    try {
        if (req.contentType === 'encoded')
            uploadCloud(req, res, (err) => {
                if (err) {
                    if (err.name === 'MulterError' && err.message === 'File too large') {
                        return next(new createError.BadRequest('File too large (<= 1MB)'));
                    }
                    return next(err);
                }
                // Trả về URL của tệp tin đã tải lên

                if (req?.files?.length === 0) req.body.images = null;
                else {
                    const urls = req.files.map(({ filename, path }) => ({ filename, path }));
                    req.body.images = urls;
                }

                next();
            });
        else next();
    } catch (err) {
        next(err);
    }
}

module.exports = { uploadHandler };
