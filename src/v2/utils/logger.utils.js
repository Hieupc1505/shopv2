require('dotenv').config();
const { format: _format, createLogger, transports: _transports } = require('winston');
const path = require('path');
const enumerateErrorFormat = _format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});

const maxsizeTransport = new _transports.File({
    level: 'info',
    format: _format.printf((info) => info.message),
    filename: path.resolve(__dirname, '../', 'storage/logs', 'maxsize.log'), //đường đẫn tạo file
    maxsize: 5242880, // 5MB
});

const storeFile =
    process.env.NODE_ENV === 'production'
        ? new _transports.File({
              filename: path.resolve(__dirname, '../', 'storage/logs', 'combined.log'),
              maxsize: 5242880,
          })
        : new _transports.Console({ stderrLevels: ['error'] });

const logger = createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: _format.combine(
        enumerateErrorFormat(),
        process.env.NODE_ENV === 'development' ? _format.colorize() : _format.uncolorize(),
        _format.splat(),
        _format.timestamp({
            // format: "YYYY-MM-DD HH:mm:ss",
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        _format.printf(({ timestamp, level, message }) => `[${timestamp}]  ${level}: ${JSON.stringify(message)}`),
    ),
    transports: [
        // new _transports.Console({
        //     stderrLevels: ['error'],
        // }),
        storeFile,
    ],
});

module.exports = logger;
