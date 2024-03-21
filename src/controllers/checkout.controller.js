'use strict'

const { SuccessResponse } = require("../cores/success.response");
const CheckoutService = require('../services/checkout.service');

class CheckoutController {
    checkoutReview = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Checkout Review',
            metadata: await CheckoutService.checkoutReview(req.body)
        }).send(res);
    }
}

module.exports = new CheckoutController();