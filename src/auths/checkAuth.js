'use strict'

const { findById } = require("../services/apikey.service");


const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();
        if (!key) {
            return res.status(403).json({
                message: 'Forbiden Error'
            })
        } 

        // check objKey
        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: 'Forbiden Error'
            })
        }
        req.objKey = objKey;
        return next();        
    } catch (error) {
        console.log(error);
    }
}

const permissions =  (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }
        const validPermission = req.objKey.permissions.includes(permission);
        if (!validPermission) {
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }
        return next();
    }
}

module.exports = {
    apiKey,
    permissions
}