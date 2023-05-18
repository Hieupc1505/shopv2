require('dotenv').config();
const logger = require('@v2/utils/logger.utils');
const errorHandler = require('@v2/utils/errorHandler.utils');
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    logger.error(err.message);

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack,
        });
    }
    if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        //Wrong Mongoose Object Id Error
        //Mongooo.find({_id: adjflkajfd})
        if (err.name === 'CastError') {
            const message = `Resource not found. Invalid ${err.path}`;
            error = new errorHandler(message, 400);
        }

        //Handling Mongoose Validation Error
        if (err.name === 'ValidationError') {
            const message = Object.values(err.values).map((value) => value.message);
            error = new errorHandler(message, 400);
        }

        res.status(err.statusCode).json({
            success: false,
            error: error.message || 'Internal Server Error',
        });
    }
};
