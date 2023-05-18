var that = (module.exports = {
    catchAsync: require('./catchAsync.utils').catchAsync,
    generateToken: require('./generateToken.util'),
    logger: require('./logger.utils'),
    validateData: require('./validation.helper'),
    jwtFeature: require('./jwt.helper'),
    errorJoi: require('./errorJoi.util'),
    validImg: require('./validImg.utils'),
    common: require('./common.utils'),
    cloudinary: require('./cloudinary.utils'),
    updateInventories: require('./handleInventories'),
});
