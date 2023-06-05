require('dotenv').config();
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { ACCESSTOKEN_SECRET } = process.env;
const { _User } = require('@v2/model/user.model');

var that = (module.exports = {
    authToken: async (req, res, next) => {
        const header = req.header('Authorization');
        try {
            const token = header && header.split(' ')[1];

            if (!token) throw new createError.Forbidden('AccessToken is incorrect!!');

            jwt.verify(token, ACCESSTOKEN_SECRET, (err, decoded) => {
                if (err) throw new createError.Unauthorized();
                console.log('start');
                req.userId = decoded.data;
                console.log('end');
                next();
            });
        } catch (err) {
            next(err);
        }
    },

    authAdmin: async (req, res, next) => {
        const header = req.header('Authorization');
        try {
            const token = header && header.split(' ')[1];

            if (!token) throw new createError.Forbidden();
            jwt.verify(token, ACCESSTOKEN_SECRET, async (err, decoded) => {
                if (err) throw new createError.Unauthorized(err);
                const user = await _User.findOne({ _id: decoded.data });

                if (user?.userInfo?.role === 0) throw new createError.Forbidden('You are not admin!!');
                req.userId = decoded.data;
                // console.log('admin');
                next();
            }).catch((err) => {
                // console.log('not admin');
                next(err);
            });
        } catch (err) {
            next(err);
            // res.send(false);
        }
    },
});
