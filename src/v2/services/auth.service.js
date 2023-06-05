const { _User } = require('@v2/model/user.model');

const createError = require('http-errors');
const client = require('@v2/configs/redis.config');

const sendMail = require('@v2/helpers/sendMail.service');
const { URL, ACCESSTOKEN_SECRET } = process.env;
const {
    errorJoi: handleJoiError,
    generateToken: { createHash },
    logger,
    validateData: { userValidate },
    jwtFeature,
} = require('@v2/utils/index');

const { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } = jwtFeature;

var that = (module.exports = {
    register: async ({ email = '', password = '' }) => {
        const { error } = userValidate({ email, password });
        if (error) {
            throw new createError.BadRequest(handleJoiError(error));
        }
        if (!email || !password) throw createError.BadRequest();
        const isExist = await _User.findOne({ email, status: 1 });
        if (isExist) throw createError.Conflict(`${email} is existed!!!`);

        const hashPass = await createHash(password);

        const tokenActivate = await signAccessToken({ email, password: hashPass }, '1h');
        const url = `${URL}/api/v2/user/activate/${tokenActivate}`;

        await sendMail(email, 'Hieu Shop 📢', 'Register', url);

        return {
            success: true,
            message: 'Vui lòng kiểm tra email',
            tokenActivate,
        };
    },
    active: async (token) => {
        if (!token) throw new createError.Forbidden();

        const decoded = await verifyAccessToken(token, ACCESSTOKEN_SECRET);
        if (!decoded) throw new createError.Forbidden();
        const {
            data: { email, password },
        } = decoded;

        const isFind = await _User.findOne({ email, status: 1 });
        if (isFind) throw new createError.BadRequest('Email is exists!!');

        const newAcc = await _User.create({ email, password });

        newAcc.save();

        return {
            success: true,
            message: 'Tài khoản đã được tạo!!',
        };
    },
    login: async (userData, provider, res) => {
        let user = null;

        if (provider === 'lc') {
            const { email, password } = userData;

            const { error } = userValidate({ email, password });
            if (error) {
                let err = handleJoiError(error);
                throw new createError.BadRequest(err);
            }
            user = await _User.findOne({ email, provider: 'lc', status: 1 }, { _id: 1, password: 1 });
            if (!user || !password) {
                throw createError.Conflict('Email or password is not correct!!');
            }
            const isValid = await user.isCheckPassword(password);
            if (!isValid) {
                throw createError.Conflict('Password is not correct!!');
            }
        } else if (provider === 'gg' || provider === 'fb') {
            if (!userData?._json) throw new createError.Unauthorized();
            const { _json } = userData;
            const email = _json.email;
            // console.log(userData);
            const { error } = userValidate({ email });
            if (error) {
                let err = handleJoiError(error);
                throw new createError.BadRequest(err);
            }

            user = await _User
                .findOneAndUpdate(
                    {
                        email,
                    },
                    {
                        $set: {
                            email,
                            provider,
                            'userInfo.userName': _json.name,
                        },
                    },
                    {
                        new: true,
                        upsert: true,
                    },
                )
                .lean();
        }
        const accessToken = await signAccessToken(user._id, '1h');
        const refreshToken = await signRefreshToken(user._id, '1d');
        res.cookie('_cookie', refreshToken, {
            httpOnly: true,
            maxAge: 60 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            user,
            accessToken,
        });
    },
    forgetPass: async ({ email }) => {
        const acc = await _User.findOne({ email, status: 1 }, { _id: 1 });

        if (!acc) throw new createError.BadRequest('Email chưa đăng ký!!');

        const tokenForget = await signAccessToken(acc._id, '10m');

        const url = `${URL}/user/reset/account/${tokenForget}`;

        await sendMail(email, 'Hieu Shop 📢', 'Reset Password', url);
        return {
            success: true,
            message: 'Vui lòng kiểm tra email để đổi mật khẩu!!',
            forgetLink: url,
        };
    },
    resetPass: async (_id, password = null) => {
        if (!password || !_id) throw new createError.BadRequest();
        const acc = await _User.findOne({ _id });

        if (!acc) throw new createError.BadRequest('Email không chính xác!!');

        const hashPass = await createHash(password);
        await _User
            .findOneAndUpdate(
                {
                    _id,
                },
                {
                    password: hashPass,
                },
                { new: true },
            )
            .catch((err) => {
                throw new createError.InternalServerError();
            });
        return {
            success: true,
            message: 'Thành công!!',
        };
    },
    refreshToken: async ({ refreshToken = null }) => {
        if (!refreshToken) throw createError.BadRequest();
        const { data: userId } = await verifyRefreshToken(refreshToken);
        const accessToken = await signAccessToken(userId, '1d');
        const refToken = await signRefreshToken(userId, '10d');

        return {
            status: 'success',
            accessToken,
            refreshToken: refToken,
        };
    },
    logout: async ({ _cookie }, res) => {
        if (!_cookie) throw new createError.BadRequest();
        const { data: userId } = await verifyRefreshToken(_cookie);
        const token = await client.get(userId.toString());
        if (token !== _cookie) {
            throw new createError.BadRequest();
        }
        await client.del(userId.toString(), (err, reply) => {
            if (err) throw new createError.InternalServerError();
        });
        res.clearCookie('_cookie');
        return {
            status: 'success',
            msg: 'Logout oki!!',
        };
    },
    disable: async ({ email }) => {
        if (!email) throw new createError.BadRequest();
        const { error } = userValidate({ email });
        if (error) {
            throw new createError(handleJoiError(error));
        }
        await _User.findOneAndUpdate(
            {
                email,
                status: 1,
            },
            {
                $set: {
                    status: -1,
                },
            },
            { upsert: false, new: false },
        );
        return {
            success: true,
            code: 1,
        };
    },
    setRole: async ({ email, role }) => {},
    getInfo: async (userId) => {
        if (!userId) throw new createError.BadRequest();
        const result = await _User.findOne({ _id: userId }).lean();
        return {
            success: true,
            data: result,
        };
    },
    // updateProfile: async ({ userName, address, number, avatar = '' }, userId) => {
    //     const profile = await _User.findOneAndUpdate(
    //         {
    //             userId,
    //         },
    //         {
    //             $addToSet: {
    //                 userName,
    //                 address,
    //                 number,
    //             },
    //         },
    //         { new: true },
    //     );
    //     return {
    //         success: true,
    //         data: profile,
    //     };
    // },
});
