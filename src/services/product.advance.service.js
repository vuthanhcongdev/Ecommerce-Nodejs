'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model');
const { BadRequestError } = require('../cores/error.response');
const { findAllDraftsForShop, 
    findAllPublishesForShop, 
    publishProductByShop, 
    searchProductByUser,
    findAllProducts,
    findProductDetails,
    updateProductById} = require('../models/repositories/product.repo');
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils');
const { insertInvenotry } = require('../models/repositories/inventory.repo');
const { pushNotiToSystem } = require('./notification.service');

// define Factory class to create Product
class ProductFactory {
    /**
     * type: 'Clothing',
     * payload
    */

    static productRegistry = {} //key-class

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Invalid Product Type ${type}`);

        return new productClass(payload).createProduct();
    }

    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Invalid Product Type ${type}`);

        return new productClass(payload).updateProduct(productId);
    }

    // PUT
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id });
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id });
    }

    // GET
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await findAllDraftsForShop({ query, limit, skip })
    }

    static async findAllPublishesForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true };
        return await findAllPublishesForShop({ query, limit, skip })
    }

    static async getListSearchProduct({ keySearch }) {
        return await searchProductByUser({ keySearch })
    }

    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = {isPublished: true} }) {
        return await findAllProducts({ limit, sort, page, filter, 
            select: ['product_name', 'product_price', 'product_thumb', 'product_shop'] 
        });
    }

    static async findProductDetails({ product_id }) {
        return await findProductDetails({ product_id, unSelect: ['__v'] })
    }
}

/**
 * product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture'] },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true },
*/
// define base product class
class Product {
    constructor({
        product_name, product_thumb, product_description, 
        product_price, product_quantity, product_type, product_shop, product_attributes
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    async createProduct(productId) {
        const newProduct = await product.create({ ...this, _id: productId });
        if (newProduct) {
            // add product_stock in inventoryc collection
            await insertInvenotry({
                productId: productId,
                shopId: this.product_shop,
                stock: this.product_quantity
            });

            // push noti to system collection
            pushNotiToSystem({
                type: "SHOP-001",
                receivedId: 1,
                senderId: this.product_shop,
                options: {
                    product_name: this.product_name,
                    product_shop: this.product_shop
                }
            }).then(rs => console.log(rs)).catch(console.error);
        }
        return newProduct;
    }

    async updateProduct(productId, payload) {
        return await updateProductById({productId, payload, model: product});
    }
}

// define sub-class for difference product types Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes);
        if (!newClothing) throw new BadRequestError('Error: Create New Clothing Error');

        const newProduct = await super.createProduct();
        if (!newProduct) throw new BadRequestError('Error: Create New Product Error');

        return newProduct;
    }

    async updateProduct(productId) {
        /*
            {
                a: undefined,
                b: null
            }
        */
       // 1. remove attr has null or undefined
       const objectParams = removeUndefinedObject(this);
       // 2. check xem update cho nao?
       if (objectParams.product_attributes) {
        // update child
        await updateProductById({productId, objectParams, model: clothing});;
       }

       const updateProduct = await super.updateProduct(productId, objectParams);
       return updateProduct;
    }
}

// define sub-class for difference product types Electornics
class Electornics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create(
            {
                ...this.product_attributes,
                product_shop: this.product_shop
            });
        if (!newElectronic) throw new BadRequestError('Error: Create New Electronic Error');

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError('Error: Create New Product Error');

        return newProduct;
    }
}

// define sub-class for difference product types Furniture
class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create(
            {
                ...this.product_attributes,
                product_shop: this.product_shop
            });
        if (!newFurniture) throw new BadRequestError('Error: Create New Furniture Error');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Error: Create New Product Error');

        return newProduct;
    }

    async updateProduct(productId) {
        /*
            {
                a: undefined,
                b: null
            }
        */
       // 1. remove attr has null or undefined
    //    console.log('[1]::', this);
       const objectParams = removeUndefinedObject(this);
    //    console.log('[2]::', objectParams);
       // 2. check xem update cho nao?
       if (objectParams.product_attributes) {
        // update child
        await updateProductById(
            {
                productId, 
                payload: updateNestedObjectParser(objectParams.product_attributes), 
                model: furniture});;
       }

       const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
       return updateProduct;
    }
}

// register product type
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronics', Electornics);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;