'use strict'

const { convertToObjectIdMongoDb } = require('../../utils');
const inventory = require('../inventory.model');

const insertInvenotry = async({ productId, shopId, stock, location = 'unknown' }) => {
    return await inventory.create({
        inven_productId: productId,
        inven_shopId: shopId,
        inven_stock: stock,
        inven_location: location
    })
}

const reservationInventory = async({ productId, quantity, cartId }) => {
    const query = {
        inven_productId: convertToObjectIdMongoDb(productId),
        inven_stock: { $gte: quantity }
    }, updateSet = {
        $inc: {
            inven_stock: -quantity
        },
        $push: {
            inven_reservations: {
                quantity,
                cartId,
                createdOn: new Date()
            }
        }
    }, options = { upsert: true, new: true };
    
    return await inventory.updateMany(query, updateSet);
}

module.exports = {
    insertInvenotry,
    reservationInventory
}