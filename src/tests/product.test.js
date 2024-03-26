const redisPubSubService = require('../services/redisPubSub.service');

class ProductServiceTest {
    purchaseProduct(productId, quantity) {
        const order = { productId, quantity };
        console.log(order);
        redisPubSubService.publish('purchaseProduct', JSON.stringify(order));
    }
}

module.exports = new ProductServiceTest();