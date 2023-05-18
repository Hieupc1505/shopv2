const { mongoose, model } = require('mongoose');
const Schema = mongoose.Schema;
// const { _userConnect } = require("../../config/mongo.muti.config");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            validate: {
                validator: function (v) {
                    // Kiểm tra xem password có được cung cấp hay không khi provider là local
                    return this.provider !== 'lc' || v;
                },
                message: 'Vui lòng nhập mật khẩu',
            },
        },
        provider: {
            type: String,
            enum: ['lc', 'gg', 'fb'],
            default: 'lc',
        },
        status: {
            type: Number,
            enum: [-1, 1, 2],
            default: 1,
        },
        userInfo: {
            userName: {
                type: String,
            },
            number: {
                type: String,
                minLength: 10,
                maxLength: 10,
            },
            address: {
                type: String,
            },
            avatar: {
                type: String,
            },
            role: {
                type: Number,
                enum: [0, 1, -1],
                default: 0,
            },
        },
    },
    {
        collection: 'users',
        timestamps: true,
    },
);

// userSchema.pre('save', async function (next) {
//     try {
//         // console.log(`Called before save:::`, this.email, this.password);
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (err) {
//         next(err);
//     }
// });
userSchema.methods.isCheckPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (err) {
        return new Error('Internal Server Error');
    }
};

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    console.log(user);
    if (!user) throw new Error('incorrect email');
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) throw new Error('internal server');
    return user;
};
module.exports = { _User: model('users', userSchema) };
// module.exports = {
//     userModel: _userConnect.model("users", userSchema),
//     // testModel : _testConnect.model("test", testSchema)
// };
