'use strict';

// const redis = require('redis');

// // create a new client redis
// const redisClient = new redis.createClient({
//     host: 'redis-12063.c295.ap-southeast-1-1.ec2.cloud.redislabs.com',
//     port: '12063',
//     username: 'default',
//     password: 'nJBfGj6rJ43j4lBURByBaY0G40iv0TJP'
// });

// redisClient.on('error', err => {
//     console.log(`Redis error: ${err}`);
// });

// module.exports = client;

// C2:
const redis = require('ioredis');
const { RedisError } = require('../cores/error.response');

const REDIS_CONNECT_TIMEOUT = 10000, REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
        vn: 'Kết nối Redis thất bại',
        en: 'Redis connect failed'
    }
};

let client = {}, statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: 'reconnecting',
    ERROR: 'error'
}, connectionTimeout;

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        throw new RedisError({
            message: REDIS_CONNECT_MESSAGE.message.vn,
            statusCode: REDIS_CONNECT_MESSAGE.code
        })
    }, REDIS_CONNECT_TIMEOUT);
}

const hanndleEventConnect = ({
    connectionRedis
}) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`Redis Connect Status: Connected`);
        clearTimeout(connectionTimeout);
    });

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`Redis Connect Status: Disconnected`);
        // connect retry
        handleTimeoutError();
    });

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`Redis Connect Status: Reconnecting`);
        handleTimeoutError();
    });

    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`Redis Connect Status: Error ${err}`);
        handleTimeoutError();
    });
}

const initRedis = async () => {
    const instanceRedis = redis.createClient();
    client.instanceConnection = instanceRedis;
    hanndleEventConnect({
        connectionRedis: instanceRedis
    });
}

const getRedis = () => client;

const closeRedis = () => {

}

module.exports = {
    initRedis,
    getRedis,
    closeRedis
}