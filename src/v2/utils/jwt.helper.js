require('dotenv').config();
const JWT = require('jsonwebtoken');
const { ACCESSTOKEN_SECRET, REFRESHTOKEN_SECRET } = process.env;
const createError = require('http-errors');
const client = require('@v2/configs/redis.config');

const signAccessToken = async (data, time) => {
    return new Promise((res, rej) => {
        const payload = {
            data,
        };
        const secret = ACCESSTOKEN_SECRET;
        const options = {
            expiresIn: time,
        };
        JWT.sign(payload, secret, options, (err, token) => {
            if (err) rej(err);
            res(token);
        });
    });
};
const signRefreshToken = async (data, time) => {
    return new Promise((res, rej) => {
        const payload = {
            data,
        };
        const secret = REFRESHTOKEN_SECRET;
        const options = {
            expiresIn: time,
        };
        JWT.sign(payload, secret, options, async (err, token) => {
            if (err) {
                rej(err);
            }

            await client.set(data.toString(), token, 'EX', 10 * 24 * 60 * 60, (err, reply) => {
                if (err) {
                    return rej(createError.InternalServerError());
                }
                res(token);
            });
        });
    });
};
const verifyAccessToken = (token) => {
    // if (!req.headers['authorization']) {
    //     return next(createError.Unauthorized());
    // }
    // const authHeader = req.headers['authorization'];
    // const token = authHeader.split(' ')[1];

    return new Promise((res, rej) => {
        JWT.verify(token, ACCESSTOKEN_SECRET, (err, payload) => {
            if (err) {
                if (err.name === 'JosonWebTokenError') return rej(createError.Unauthorized('verify accesstoken'));
                return rej(createError.Unauthorized(err.message));
            }
            res(payload);
        });
    });
};
const verifyRefreshToken = (refreshToken) => {
    return new Promise((res, rej) => {
        JWT.verify(refreshToken, REFRESHTOKEN_SECRET, (err, payload) => {
            if (err) {
                return rej(err);
            }
            client.get(payload.data, (err, reply) => {
                if (err) return rej(createError.InternalServerError());
                if (refreshToken === reply) return res(payload);
                return rej(createError.Unauthorized());
            });
            // return res(payload);
        });
    });
};
module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken,
};
