'use strict'

const { model, Schema } = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema({
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_slug: String, // quan-jean-cao-cap
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture'] },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true },
    // more
    product_ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: (val) => Math.round(val * 10) / 10, // 4.33365 => 4.3
    },
    product_variations: {
        type: Array,
        default: []
    },
    isDraft: {
        type: Boolean,
        default: true,
        index: true,
        select: false, // false để khi dùng findOne(),... sẽ không lấy field này ra
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
        select: false,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

// Create index for search
productSchema.index({ product_name: 'text', product_description: 'text' });

// Document middleware: runs before .save() or .create() or ...
productSchema.pre('save', function (next) {
    this.product_slug = slugify(this.product_name, { lower: true });
    next();
}); // trước khi gọi save() thì sẽ vào middleware này

// defind the product type = clothing
const clothingSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' }
}, {
    timestamps: true,
    collection: 'clothes'
});

// defind the product type = electronic
const electronicSchema = new Schema({
    manufacturer: { type: String, required: true },
    model: String,
    color: String
}, {
    timestamps: true,
    collection: 'electronics'
});

// defind the product type = furniture
const furnitureSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' }
}, {
    timestamps: true,
    collection: 'furnitures'
});

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Clothing', clothingSchema),
    electronic: model('Electronics', electronicSchema),
    furniture: model('Furniture', furnitureSchema),
}