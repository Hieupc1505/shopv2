const crypto = require('crypto');
var that = (module.exports = {
    randomString: (length) => crypto.randomBytes(length).toString('hex'),
    encodeBase64: (data) => {
        return Buffer.from(JSON.stringify(data)).toString('base64');
    },
    decodeBase64ToUTF8: (string) => {
        return JSON.parse(Buffer.from(string, 'base64').toString('utf-8'));
    },
});
