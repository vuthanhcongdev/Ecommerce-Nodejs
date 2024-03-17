'use strict'

const _ = require('lodash');

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
}

// ['a', 'b'] => { a: 1, b: 1 }
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]));
}

// ['a', 'b'] => { a: 0, b: 0 }
const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]));
}

const removeUndefinedObject = obj => {
    Object.keys(obj).forEach(key => {
        if (obj[key] == null) {
            delete obj[key];
        }
    });
    return obj;
}

/*
    const a = {
        c: {
            d: 1
        }
    }

    db.collections.updateOne({
        `c.d`: 1
    })
*/
const updateNestedObjectParser = obj => {
    const final = {};
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            const response = updateNestedObjectParser(obj[key]);
            Object.keys(response).forEach(key1 => {
                final[`${key}.${key1}`] = response[key1];
            });
        } else {
            final[key] = obj[key];
        }
    });
    return final;
}

module.exports = {
    getInfoData,
    getSelectData,
    getUnSelectData,
    removeUndefinedObject,
    updateNestedObjectParser
}