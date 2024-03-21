'use strict'

const { SuccessResponse } = require("../cores/success.response");
const InventoryService = require('../services/inventory.service');

class InventoryController {
    addStockToInventory = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Add Stock To Inventory',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).send(res);
    }
}

module.exports = new InventoryController();