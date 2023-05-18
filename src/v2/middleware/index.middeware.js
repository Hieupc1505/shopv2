module.exports = {
    authToken: require('./authToken.middeware'),
    errorHandler: require('./error.middleware'),
    authPassport: require('./authPassPort.middeware'),
    cloudinary: require('./cloudinary.middleware'),
    fillterTypeReq: require('./fillterTypeReq'),
    paymentVNP: require('./payment.middleware'),
};
