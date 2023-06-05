const { randomString } = require('@v2/utils/common.utils');
module.exports = function uploadImagesSequentially(images, cloudinary, folderName = 'shopv2') {
    const results = [];

    return images.reduce((promiseChain, image, index) => {
        return promiseChain.then(() => {
            return new Promise((resolve, reject) => {
                const [filename, base64String] = image;
                console.log(filename);

                cloudinary.uploader.upload(
                    base64String,
                    {
                        public_id: `${filename}${randomString(6)}`,
                        folder: folderName,
                        timeout: 60000,
                    },
                    (err, result) => {
                        if (err) reject(err);
                        else {
                            results.push({ filename: result.public_id, path: result.url });
                            // Remove the uploaded image from the array and call the function recursively with the remaining images.
                            if (index === images.length - 1) {
                                resolve(results);
                            } else {
                                resolve();
                            }
                        }
                    },
                );
            });
        });
    }, Promise.resolve());
};
