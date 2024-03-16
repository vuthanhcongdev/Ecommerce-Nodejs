'use strict'

const { CreatedResponse, SuccessResponse } = require("../cores/success.response");
const ProductService = require('../services/product.service');
const ProductAdvanceService = require('../services/product.advance.service');

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Product Success',
            metadata: await ProductService.createProduct(
                req.body.product_type, 
                {
                    ...req.body,
                    product_shop: req.user.userId
                })
        }).send(res);
    };

    createProductAdvance = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Product Advance Success',
            metadata: await ProductAdvanceService.createProduct(
                req.body.product_type, 
                {
                    ...req.body,
                    product_shop: req.user.userId
                })
        }).send(res);
    }
}

module.exports = new ProductController();