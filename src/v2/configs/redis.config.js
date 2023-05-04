require("dotenv").config();
const Redis = require("ioredis");

// const client = new Redis({
//     host: "rediSearch",
//     port: 6379,
// });
// const client = new Redis(6379, "rediSearch");

const client = new Redis(); 

// client.connect();

client.ping(function (err, result) {
    console.log(result);
});

client.on("connect", () => {
    console.log("Redis client connected with URL docker default");
});

client.on("error", (error) => {
    console.error(error);
});

module.exports = client;
