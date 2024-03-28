'use strict'

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'Notifications';

const notificationSchema = new Schema({
    noti_type: { type: String, enum: ['ORDER-001', 'ORDER-002', 'PROMOTION-001', 'SHOP-001'], required: true },
    noti_senderId: { type: Schema.ObjectId, required: true, ref: 'Shop' },
    noti_receivedId: { type: Number, required: true },
    noti_content: { type: String, required: true },
    noti_options: { type: Object, default: {} },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

//Export the model
module.exports = model(DOCUMENT_NAME, notificationSchema);