'use strict'

const Notification = require('../models/notification.model');

const pushNotiToSystem = async ({
    type = "SHOP-001",
    receivedId = 1,
    senderId = 1,
    options = {}
}) => {
    let noti_content;
    if(type === "SHOP-001") {
        noti_content = `Shop ${senderId} has new promotion`;
    } else if (type === "PROMOTION-001") {
        noti_content = `Promotion ${senderId} has new promotion`;
    }

    const newNoti = await Notification.create({
        noti_type: type,
        noti_senderId: senderId,
        noti_receivedId: receivedId,
        noti_content,
        noti_options: options
    });

    return newNoti;
}

const listNotiByUser = async({
    userId = 1,
    type = 'ALL',
    isRead = 0
}) => {
    const match = {
        noti_receivedId: userId
    };
    if (type !== 'ALL') {
        match['noti_type'] = type;
    }
    return await Notification.aggregate([
        {
            $match: match
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                noti_type: 1,
                noti_senderId: 1,
                noti_receivedId: 1,
                noti_content: {
                    $concat: [
                        {
                            $substr: ['$noti_options.product_shop', 0, -1]
                        },
                        ' has new product',
                        {
                            $substr: ['$noti_options.product_name', 0, -1]
                        }
                    ]
                },
                createdAt: 1,
                noti_options: 1,
            }
        }
    ]);
}

module.exports = {
    pushNotiToSystem,
    listNotiByUser
}