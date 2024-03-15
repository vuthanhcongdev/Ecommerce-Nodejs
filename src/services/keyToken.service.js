'use strict'

const { Types } = require("mongoose");
const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
    // static createKeyToken = async ({ userId, publicKey }) => {
    //     try {
    //         const publicKeyString = publicKey.toString();
    //         const tokens = await keyTokenModel.create({
    //             user: userId,
    //             publicKey: publicKeyString
    //         });
    //         return tokens ? publicKeyString : null;
    //     } catch (error) {
    //         return error;
    //     }
    // }

    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            const filter = { user: userId };
            const update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken };
            const options = { upsert: true, new: true }
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options );

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    }

    static findByUserId = async (userId) => {
        console.log(34, userId);
        return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne(id);
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken }).lean();
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshToken });
    }

    static deleteKeyById = async (userId) => {
        return await keyTokenModel.deleteOne({ user: userId });
    }
}

module.exports = KeyTokenService;