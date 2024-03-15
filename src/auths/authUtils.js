'use strict'

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError } = require('../cores/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const createTokenPair = async (payload, privateKey, publicKey) => {
    try {
        // accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            // algorithm: 'RS256',
            expiresIn: '2 days'
        });

        // refreshToken
        const refreshToken = await JWT.sign(payload, privateKey, {
            // algorithm: 'RS256',
            expiresIn: '2 days'
        });

        // verify
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error('Error Verify Token', err);
            } else {
                console.log('Decode Verify Token', decode);
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {
        
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1. Check userId missing?
        2. Get accessToken
        3. verify token
        4. check user in dbs?
        5. check keyStore with this userId?
        6. OK all => return next
    */
   // 1.
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError('Invalid Request');

    // 2.
    const keyStore = await findByUserId(userId);
    console.log(58, keyStore)
    if (!keyStore) throw new NotFoundError(`Not Found KeyStore By UserId::${userId}`);

    // 3.
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError('Invalid Request');

    // 4. 5.
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User');

        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

const verifyToken = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
}

module.exports = {
    createTokenPair,
    authentication,
    verifyToken
}