'use strict'

const { product, clothing, electronic, furniture } = require('../product.model');
const { Types } = require('mongoose');
const { getSelectData, getUnSelectData } = require('../../utils/index')

const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
}

const findAllPublishesForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
}

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);
    const results = product.find(
        {
            isDraft: false,
            $text: { $search: regexSearch } 
        },
        {
            score: { $meta: 'textScore' } 
        }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean();

    return results;
}

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    });

    if (!foundShop) return null;
    
    foundShop.isDraft = false;
    foundShop.isPublished = true;
    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    });

    if (!foundShop) return null;
    
    foundShop.isDraft = true;
    foundShop.isPublished = false;
    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
}

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    const products = await product.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean();

    return products;
}

const findProductDetails = async ({ product_id, unSelect }) => {
    return await product.findById(product_id).select(getUnSelectData(unSelect));
}

const updateProductById = async ({ productId, payload, model, isNew = true }) => {
    return await model.findByIdAndUpdate(productId, payload, { new: isNew });
}

const queryProduct = async ({ query, limit, skip }) => {
    return await product.find(query).populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishesForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProductDetails,
    updateProductById
}