'use strict'

const { BadRequestError, NotFoundError } = require('../cores/error.response');
const { convertToObjectIdMongoDb } = require('../utils/index');
const { getProductById } = require('../models/repositories/product.repo')
const cart = require('../models/cart.model');

/**
 * Cart Service
 * 1. Add product to cart [USER]
 * 2. Reduce product quantity by one [USER]
 * 3. Incrase product quantity by one [USER]
 * 4. Get cart [USER]
 * 5. Delete card [USER]
 * 6. Delete cart item [USER]
*/

class CartService {

    static async createCartUser({ userId, product }) {
        const query = { cart_userId: userId, cart_state: 'active' };
        const updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        };
        const options = { upsert: true, new: true };
        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateQuantityProductInCart({ userId, product }) {
        const { productId, quantity } = product;
        const query = { 
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active'
        };
        const updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        };
        const options = { upsert: true, new: true };

        return await cart.findOneAndUpdate(query, updateSet, options);
    }

    static async addToCart({ userId, product= {} }) {
        // check cart exists
        const userCart = await cart.findOne({ cart_userId: userId });
        if (!userCart) {
            // create cart for UserId
            return await CartService.createCartUser({ userId, product })
        }

        // neu co san pham roi nhung chua co san pham
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product];
            return await userCart.save();
        }

        // neu gio hang ton tai va co san pham nay thi update quantity
        return await CartService.updateQuantityProductInCart({ userId, product });
    }

    // update cart
    /*
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    {
                        shopId,
                        price,
                        old_quantity,
                        quantity,
                        productId
                    }
                ],
                version
            }
        ]
    */
    static async addToCartV2({ userId, shop_order_ids = {} }) {
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0];
        // check product
        const foundProduct = await getProductById(productId);
        if (!foundProduct) throw new NotFoundError('Product Not Exists!');

        // compare
        if (foundProduct.product_shop?.toString() !==  shop_order_ids[0]?.shopId) 
            throw new NotFoundError('Product do not belong to the shop!');

        if (quantity === 0) {
            // deleted
        }

        return await CartService.updateQuantityProductInCart({ 
            userId, 
            product: { 
                productId, 
                quantity: quantity - old_quantity 
            } 
        });
    }

    static async deleteUserCart({ userId, productId }) {
        console.log(userId, productId);
        const query = { cart_userId: userId, cart_state: 'active' };
        const updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            }
        };
        const deleteCart = await cart.updateOne(query, updateSet);
        return deleteCart;
    }

    static async getListCart({ userId }) {
        return await cart.findOne({
            cart_userId: +userId
        }).lean();
    }
}

module.exports = CartService;