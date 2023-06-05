require('dotenv').config();
require('module-alias/register');
const express = require('express');
const app = express();

//import package
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');

//import ultils
const logger = require('@v2/utils/logger.utils');
const db = require('@v2/configs/db.config');
const errorMiddleware = require('@v2/middleware/error.middleware');
const errorHandle = require('http-errors');

//main route v2
const routev2 = require('@v2/routers/index');

// require("@v2/configs/redis.config");

// Allow CORS across-the-board
if (process.env.NODE_ENV === 'development') {
    app.use(
        cors({
            credentials: true,
            origin: ['http://localhost:5173', 'http://localhost:27017'],
            exposedHeaders: ['set-cookie'],
        }),
    );
    // app.options('*', cors());
} else if (process.env.NODE_ENV === 'production') {
    app.use(
        cors({
            credentials: true,
            origin: [process.env.PROD_CLIENT_DOMAIN],
        }),
    );
}

//use middleware
app.use(compression());
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

//connect to database
db.connect();

//main route
routev2(app);

//default error not found
app.use((req, res, next) => {
    next(errorHandle.NotFound('Page is not fount'));
});

//hanlde error
app.use(errorMiddleware);

const serverErrorHandler = (error) => {
    logger.error(error);
    if (server) {
        server.close();
    } else {
        process.exit(1);
    }
};

const PORT = +process.env.PORT || 8500;

const server = app.listen(PORT, () => {
    logger.info(`App is running at:::${PORT}`);
});

// Event handlers go here
// Catch 'unhandledRejection' uncaught error thrown by a promise
//unhandledRejection thì có TH đó là sai string của database
process.on('unhandledRejection', serverErrorHandler);
// Catch 'uncaughtException' uncaught error thrown by a random event
//uncaughtException này thì console.log(a) mà a không được khai báo
process.on('uncaughtException', serverErrorHandler);
// Clean up process after server closed
process.on('exit', () => {
    logger.info('Server closed');
});
process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
