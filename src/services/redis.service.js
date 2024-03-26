'use strict'
const redis = require('redis');
const { promisify } = require('util');
const { reservationInventory } = require('../models/repositories/inventory.repo');

const redisClient = redis.createClient();

// const pexpire = promisify(redisClient.pexpire).bind(redisClient);
// const setnxAsync = promisify(redisClient.setnx).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
    // const key = `lock_v2024_${productId}`;
    // const retryTimes = 10;
    // const expireTime = 3000;

    // for (let i = 0; i < retryTimes.length; i++) {
    //     // tạo 1 key, thang nao nam giu duoc vao thanh toan
    //     const result = setnxAsync(key, expireTime);
    //     console.log(`Result:::${result}`);
    //     if (result === 1) {
    //         // thao tac voi inventory
    //         const isReservation = await reservationInventory({
    //             productId, quantity, cartId
    //         });
    //         if (isReservation.modifiedCount) {
    //             await pexpire(key, expireTime); // khoa duoc giai phong sau 3s
    //             return key; // key nay dung de xoa khi dat hang xong
    //         }
    //         return null;
    //     } else {
    //         return new Promise((resolve) => setTimeout(resolve, 50));
    //     }
    // }
}

const releaseLock = async keyLock => {
    // const delAsyncKey = promisify(redisClient.del).bind(redisClient);
    // return await delAsyncKey(keyLock);
}

module.exports = {
    acquireLock,
    releaseLock
}