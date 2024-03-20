'use strict'

const express = require('express');
const discountController = require('../../controllers/discount.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auths/authUtils');
const router = express.Router();

// get amout a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount));
router.get('/list_product_code', asyncHandler(discountController.getAllDiscountCodesWithProduct));

router.use(authentication);

router.post('', asyncHandler(discountController.createDiscount));
router.get('', asyncHandler(discountController.getAllDiscountCodesWithProduct));

module.exports = router;
