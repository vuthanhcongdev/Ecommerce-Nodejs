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

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish Product Success',
            metadata: await ProductAdvanceService.publishProductByShop({
                    product_shop: req.user.userId,
                    product_id: req.params.id
                })
        }).send(res);
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Unpublish Product Success',
            metadata: await ProductAdvanceService.unPublishProductByShop({
                    product_shop: req.user.userId,
                    product_id: req.params.id
                })
        }).send(res);
    }

    // QUERY
    /**
     * @desc Get all Drafts for shop
     * @param {Number } limit 
     * @param {Number } skip
     * @return { JSON } 
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get All Product Draft Success',
            metadata: await ProductAdvanceService.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res);
    }

    getAllPublishesForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get All Product Published Success',
            metadata: await ProductAdvanceService.findAllPublishesForShop({
                product_shop: req.user.userId
            })
        }).send(res);
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get All Product By Key Search Success',
            metadata: await ProductAdvanceService.getListSearchProduct(req.params)
        }).send(res);
    }
    // END QUERY
}

module.exports = new ProductController();