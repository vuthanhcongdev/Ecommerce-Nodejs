'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
// const crypto = require('crypto');
const crypto = require('node:crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyToken } = require("../auths/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../cores/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

// class AccessService {
//     static signUp = async ({ name, email, password }) => {
//         try {
//             // step 1: check email exists?
//             const holderShop = await shopModel.findOne({ email }).lean();
//             if (holderShop) {
//                 return {
//                     code: 'xxx',
//                     message: 'Shop already registered'
//                 }
//             }

//             const passwordHash = await bcrypt.hash(password, 10);

//             const newShop = await shopModel.create({
//                 name, email, password: passwordHash, roles: [RoleShop.SHOP]
//             });

//             if (newShop) {
//                 // create privateKey (return for clients and not save on server) để sign token, 
//                 // publicKey (save on server) để verify token
//                 const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
//                     modulusLength: 4096,
//                     privateKeyEncoding: {
//                         type: 'pkcs1',
//                         format: 'pem'
//                     },
//                     publicKeyEncoding: {
//                         type: 'pkcs1',
//                         format: 'pem'
//                     }
//                 }) 
//                 // pkcs: public key cryptoGraphy standards 
//                 // pem: 
//                 // thuật toán rsa: thuật toán bất đối xứng

//                 console.log({privateKey, publicKey});

//                 const keyPublicString = await KeyTokenService.createKeyToken({
//                     userId: newShop._id,
//                     publicKey
//                 });

//                 if (!keyPublicString) {
//                     return {
//                         code: 'xxx',
//                         message: 'keyPublicString error'
//                     }
//                 }

//                 console.log(`keyPublicString::`, keyPublicString);
//                 const keyPublicObject = crypto.createPublicKey(keyPublicString);
//                 console.log(`keyPublicObject::`, keyPublicObject);

//                 const tokens = await createTokenPair({ userId: newShop._id, email }, privateKey, keyPublicString);
//                 console.log(`Create Token Success::`, tokens);
                
//                 return {
//                     code: 201,
//                     metadata: {
//                         shop: getInfoData({ fields: ['_id','name','email'], object: newShop }),
//                         tokens  
//                     }
//                 }
//             }

//             return {
//                 code: 200,
//                 metadata: null
//             }
//         } catch (error) {
//             return {
//                 code: 500,
//                 message: error.message,
//                 status: 'error'
//             }
//         }
//     }
// }
class AccessService {
    /**
     * 1. check email in dbs
     * 2. match password
     * 3. create AT vs RT and save
     * 4. generate tokens
     * 5. get data return token 
     */
    static login = async ({email, password, refreshToken = null}) => {
        // 1.
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError("Error: Shop not registered!");

        // 2.
        const matchPassword = bcrypt.compare(password, foundShop.password);
        if (!matchPassword) throw new AuthFailureError("Error: ")

        // 3.
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        // 4.
        const { _id: userId } = foundShop._id;
        const tokens = await createTokenPair({ userId, email }, privateKey, publicKey);
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken, 
            privateKey,
            publicKey,
            userId
        });
        return {
            shop: getInfoData({ fields: ['_id','name','email'], object: foundShop }),
            tokens  
        }
    }

    static signUp = async ({ name, email, password }) => {
        try {
            // step 1: check email exists?
            const holderShop = await shopModel.findOne({ email }).lean();
            if (holderShop) {
                throw new BadRequestError('Error: Shop already registered!')
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            });

            if (newShop) {
                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                });

                if (!keyStore) {
                    throw new BadRequestError('Error: KeyStore error!')
                }

                const tokens = await createTokenPair({ userId: newShop._id, email }, privateKey, publicKey);
                
                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({ fields: ['_id','name','email'], object: newShop }),
                        tokens  
                    }
                }
            }

            return {
                code: 200,
                metadata: null
            }
        } catch (error) {
            return {
                code: 500,
                message: error.message,
                status: 'error'
            }
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log(189, delKey);
        return delKey;
    }

    /*
        1. Check refresh token used?
    */
    static handleRefreshToken = async (refreshToken) => {
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
        if (foundToken) {
            const { userId, email } = await verifyToken(refreshToken, foundToken.privateKey);  
            console.log({ userId, email })

            // xoa tat ca token trong keyStore
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something wrong happen!! Pls relogin')
        }

        //
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) throw new AuthFailureError('Shop not registered 1!');

        // verify token
        const { userId, email } = await verifyToken(refreshToken, holderToken.privateKey);
        console.log('[2]--', { userId, email });
        // check userId
        const foundShop = await findByEmail({email});
        if (!foundShop) throw new AuthFailureError('Shop not registered 2!');

        // create new access, refresh token
        const tokens = await createTokenPair({ userId, email }, holderToken.privateKey, holderToken.publicKey);

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        });

        return { 
            user: { userId, email },
            tokens 
        }
    }
}

module.exports = AccessService;