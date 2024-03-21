'use strict'

const cart = require('../cart.model');
const { convertToObjectIdMongoDb } = require('../../utils/index');


const findCartById = async(cartId) => {
    return await cart.findOne({ _id: convertToObjectIdMongoDb(cartId), cart_state: 'active' }).lean();
}

module.exports = {
    findCartById
}