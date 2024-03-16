'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model');
const { BadRequestError } = require('../cores/error.response');

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
        return await product.create({ ...this, _id: productId });
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
}

// register product type
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronics', Electornics);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;