'use strict'

const express = require('express');
const notificationController = require('../../controllers/notification.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const router = express.Router();
const { authentication } = require('../../auths/authUtils');

router.use(authentication);

router.get('', asyncHandler(notificationController.listNotiByUser));

module.exports = router;