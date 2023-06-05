// require("dotenv").config();
// const Redis = require("ioredis");

// // const client = new Redis({
// //     host: "rediSearch",
// //     port: 6379,
// // });
// // const client = new Redis(6379, "rediSearch");

// const client = new Redis();

// // client.connect();

// client.ping(function (err, result) {
//     console.log(result);
// });

// client.on("connect", () => {
//     console.log("Redis client connected with URL docker default");
// });

// client.on("error", (error) => {
//     console.error(error);
// });

// module.exports = client;

require('dotenv').config();
const { createClient } = require('redis');
const Redis = require('ioredis');

const client = new Redis({
    port: 14705, // Redis port
    host: 'redis-14705.c89.us-east-1-3.ec2.cloud.redislabs.com', // Redis host
    username: 'default', // needs Redis >= 6
    password: 'L1FRmOFnyUBLJvVK3dqrpooiAZQhyFeJ',
    db: 0, // Defaults to 0
});

// client.connect();
client.ping(function (err, result) {
    console.log(result);
});

client.on('connect', () => {
    console.log('Redis client connected with URL redis cloud');
});

client.on('error', (error) => {
    console.error(error);
});

module.exports = client;
