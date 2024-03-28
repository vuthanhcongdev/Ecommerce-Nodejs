'use strict'

const { SuccessResponse } = require("../cores/success.response");
const { listNotiByUser } = require('../services/notification.service');

class NotificationController {
    listNotiByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Get List Notification',
            metadata: await listNotiByUser(req.query)
        }).send(res);
    }
}

module.exports = new NotificationController();