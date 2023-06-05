var that = (module.exports = (req, res, next) => {
    const contentType = req.headers['content-type'];

    if (contentType.match(/^application\/json/)) {
        req.contentType = 'json';
    } else if (contentType.match(/^multipart\/form-data/)) {
        // xử lý dữ liệu data form
        req.contentType = 'encoded';
    }
    // console.log(req.contentType);
    next();
});
