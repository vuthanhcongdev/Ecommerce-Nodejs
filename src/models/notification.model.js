'use strict'

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'Notifications';

// quy dinh cua moi cong ty
// ORDER-001: order successfully
// ORDER-002: order failed
// PROMOTION-001: new promotion
// SHOP-001: 1 shop co san pham moi -> thong bao cho tat ca nguoi dung follow shop do

const notificationSchema = new Schema({
    noti_type: { type: String, enum: ['ORDER-001', 'ORDER-002', 'PROMOTION-001', 'SHOP-001'], required: true },
    noti_senderId: { type: Schema.ObjectId, required: true, ref: 'Shop' },
    noti_receivedId: { type: Number, required: true },
    noti_content: { type: String, required: true },
    noti_options: { type: Object, default: {} }, // ví dự sử dụng options: bạn nhận được voucher của shop ABC thì shop ABC sẽ được đưa vào options
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

//Export the model
module.exports = model(DOCUMENT_NAME, notificationSchema);