'use strict'

const { CreatedResponse, SuccessResponse } = require("../cores/success.response");
const CartService = require('../services/cart.service');

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Create New Cart',
            metadata: await CartService.addToCart(req.body)
        }).send(res);
    }

    // update + -
    update = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Update Cart',
            metadata: await CartService.addToCartV2(req.body)
        }).send(res);
    }

    delete = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Delete Cart',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res);
    }

    listToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success List Cart',
            metadata: await CartService.getListCart(req.query)
        }).send(res);
    }
}

module.exports = new CartController();