const {
    authToken: { authAdmin, authToken },
} = require('@v2/middleware/index.middeware');

const { catchAsync } = require('@v2/utils/index');

const {
    register,
    active,
    login,
    forgetPass,
    resetPass,
    refreshToken,
    logout,
    disable,
    setRole,
} = require('@v2/services/auth.service');

var that = (module.exports = {
    login: catchAsync(async (req, res, next) => {
        // console.log("heoo");
        if (req.provider) return res.status(200).json(await login(req.user, req.provider));
        res.status(200).json(await login(req.body, 'lc'));
    }),
    register: catchAsync(async (req, res, next) => {
        res.status(200).json(await register(req.body));
    }),
    //[GET] /user/activate
    activate: catchAsync(async (req, res, next) => {
        const token = req?.params?.token;

        res.status(200).json(await active(token));
    }),
    refreshToken: catchAsync(async (req, res, next) => {
        res.status(200).json(await refreshToken(req.body));
    }),
    logout: catchAsync(async (req, res, next) => {
        res.status(200).json(await logout(req.body));
    }), // [POST] /user/forget
    forgetPass: catchAsync(async (req, res, next) => {
        res.status(200).json(await forgetPass(req.body));
    }),
    //[POST] /forget/account/:token
    resetPass: [
        authToken,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await resetPass(req.body?.userId, req.body?.password));
        }),
    ],
    disable: [
        authAdmin,
        catchAsync(async (req, res, next) => {
            res.status(200).json(await disable(req));
        }),
    ],
    setRole: [
        authAdmin,
        catchAsync(async (req, res, next) => {
            return {
                success: true,
                message: 'set role',
            };
        }),
    ],
});
