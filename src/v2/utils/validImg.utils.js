var that = (module.exports = (images) => {
    let errors = [];
    let data = [];

    for (let { filename, base64String } of images) {
        const imgData = Buffer.from(base64String.split(',')[1]);
        const imgSize = imgData.length;
        const imgType = base64String.split(',')[0].split(';')[0].split(':')[1];
        if (imgSize > 1024 * 1024) {
            errors.push({
                [filename]: 'File too large!!',
            });
        }
        if (imgType !== 'image/jpeg' && imgType !== 'image/png') {
            errors.push({
                [filename]: 'Type file is not be support!!',
            });
        }
        filename = filename.replace(/(\.jpg|\.jpeg|\.png)$/, '-');
        // Ảnh hợp lệ
        data.push([filename, base64String]);
    }

    return [errors, data];
});
