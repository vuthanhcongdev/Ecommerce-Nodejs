'use strict'

const { SuccessResponse } = require("../cores/success.response");
const DiscountService = require('../services/discount.service');

class DiscountController {
    createDiscount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Code Generations',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res);
    }

    getDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Code Found',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res);
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res);
    }

    getAllDiscountCodesWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query
            })
        }).send(res);
    }
}

module.exports = new DiscountController();