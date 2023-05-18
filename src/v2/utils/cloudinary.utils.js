var that = (module.exports = {
    removeImg: (filename) => {
        return new Promise((res, rej) => {
            if (!filename) rej('file name is required');
            cloudinary.uploader.destroy(filename, async (err, result) => {
                if (err) rej(err);
                res(true);
            });
        });
    },
    fileFilter: (req, file, cb) => {
        // Kiểm tra định dạng tệp tin
        if (!file.mimetype.match(/(jpg|jpeg|png)$/)) {
            return cb(new Error(`File ${file.originalname} không được hỗ trợ.`));
        }

        if (req.method === 'PATCH' && !req.body.productId) {
            return cb(new createError.BadRequest('ProductId is required'));
        }
        // Kiểm tra kích thước tệp tin
        cb(null, true);
    },
});
