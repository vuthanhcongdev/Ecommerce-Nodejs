'use strict'

const { BadRequestError, NotFoundError } = require('../cores/error.response');
const { convertToObjectIdMongoDb } = require('../utils/index')
const discount = require('../models/discount.model');
const { findAllProducts } = require('../models/repositories/product.repo');
const { findAllDiscountCodeUnselect, 
    checkDiscountExists } = require('../models/repositories/discount.repo');

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
            throw new BadRequestError('Discount Code Has Expried!');
        }

        if (new Date(start_date) > new Date(end_date)) {
            throw new BadRequestError('Start Date must be before End Date');
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
            model: discount
        });
        return discounts;
    }

    /*
        Apply discount code for product | order [User]
        orders = [
            {
                productId,
                shopId,
                quantity,
                name, 
                price
            },
            {
                productId,
                shopId,
                quantity,
                name, 
                price
            },
        ]
    */
    static async getDiscountAmount({
        codeId, userId, shopId, productOrders
    }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDb(shopId)
            }
        });
        if (!foundDiscount) throw new NotFoundError('Discount does not exists!');

        const { 
            discount_is_active,     
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_users_used,
            discount_type,
            discount_max_uses_per_user,
            discount_value } = foundDiscount;
        if (!discount_is_active) throw new NotFoundError('Discount Expried!');
        if (!discount_max_uses) throw new NotFoundError('Discount Are Out!');

        if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
            return BadRequestError('Discount Code Has Expried!');
        }

        // check xem co gia tri toi thieu hay khong
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            // get total
            totalOrder = productOrders.reduce((acc, product) => {
                return acc + (product.quantity * product.price); 
            }, 0);

            if (totalOrder < discount_min_order_value) 
                throw new NotFoundError(`Discount requires a minium order value  of ${discount_min_order_value}`);
        }

        if (discount_max_uses_per_user > 0) {
            const userUseDiscount = discount_users_used.find(user => user.userId === userId);
            if (userUseDiscount) {
                //...
            }
        }

        // check xem discount nay la fixed_amount
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100);

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        });
        return deleted;
    }

    static async cancelDiscountCode({ shopId, codeId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: shopId
            }
        });

        if (!foundDiscount) throw new BadRequestError('Discount Exists!');
    
        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_users_used: -1
            }
        });

        return result;
    }
}

module.exports = DiscountService;