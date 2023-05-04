require("dotenv").config();
const logger = require("@v2/utils/logger.utils");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false)
const { DB_CONNECT_URL } = process.env;

function isOkay() {
    logger.info("connect to mongodb is OKay"); // check mongodb có kết nối thành công hay không
}

module.exports = {
    connect: async () => {
        try {
            await mongoose.connect(DB_CONNECT_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            logger.info("DB is connecting..!!");
        } catch (err) {
            logger.error(err);
        }
    },
};
