'use strict'

const express = require('express');
const productController = require('../../controllers/product.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auths/authUtils');
const router = express.Router();

router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct)) // không cần authen vì user không cần login cũng phải search được

router.use(authentication);

router.post('', asyncHandler(productController.createProduct));
router.post('/advance', asyncHandler(productController.createProductAdvance));
router.post('/publish/:id', asyncHandler(productController.publishProductByShop));
router.post('/unpublish/:id', asyncHandler(productController.unPublishProductByShop));

// QUERY
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop));
router.get('/publishes/all', asyncHandler(productController.getAllPublishesForShop));

module.exports = router;