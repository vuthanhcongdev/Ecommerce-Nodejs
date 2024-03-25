const redisPubSubService = require('../services/gitPubSub.service');

class InventoryServiceTest {
    constructor() {
        redisPubSubService.subscribe('purchaseProduct', (channel, message) => {
            InventoryServiceTest.updateInventory(message);
        });
    }

    static updateInventory(productId, quantity) {
        console.log(`Update Inventory ${productId} with quantity ${quantity}`);
    }
}

module.exports = new InventoryServiceTest();