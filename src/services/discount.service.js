'use strict'

const { BadRequestError, NotFoundError } = require('../cores/error.response');
const { convertToObjectIdMongoDb } = require('../utils/index')
const discount = require('../models/discount.model');
const { findAllProducts } = require('../models/repositories/product.repo');
const { findAllDiscountCodeUnselect, findAllDiscountCodeSelect } = require('../models/repositories/discount.repo');

/**
 * Discount Service
 * 1. Generator Discount Code [Shop | Admin]
 * 2. Get Discount Amount [User]
 * 3. Get All Discount Codes [User | Shop]
 * 4. Verify Discount Code [User]
 * 5. Delete Discount Code [Shop]
 * 6. Cancel Discount Code [User]
*/

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, name, value,
            description, type, max_value, max_uses, uses_count, max_uses_per_user, users_used
        } = payload;
        if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            return BadRequestError('Discount Code Has Expried!');
        }

        if (new Date(start_date) > new Date(end_date)) {
            return BadRequestError('Start Date must be before End Date');
        }

        // create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        }).lean();
        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount Exists!');
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        });

        return newDiscount;
    }

    static async updateDiscountCode() {
        // 
    }

    /*
        Get All Discount Code Available with products
    */
    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }) {
        // create index for discount_code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        }).lean();

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount Not Exists!');
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;
        let products;
        if (discount_applies_to === 'all') {
            // get all products
            products = await findAllProducts({ 
                filter: { 
                    product_shop: convertToObjectIdMongoDb(shopId),
                    isPublished: true
                },
                limit: +limit, 
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }

        if (discount_applies_to === 'specific') {
            // get the product ids
            products = await findAllProducts({ 
                filter: { 
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                limit: +limit, 
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }
        return products;
    }

    /*
        Get All Discount Code By Shop
    */
    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }) {
        const discounts = await findAllDiscountCodeUnselect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongoDb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: 'discount'
        });
        return discounts;
    }
}