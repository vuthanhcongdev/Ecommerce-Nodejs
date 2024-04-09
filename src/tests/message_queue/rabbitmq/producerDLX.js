const amqp = require('amqplib');

const messages = 'RabbitMQ Producer Publish New Message';

const log = console.log;
console.log = function () {
    log.apply(console, [new Date()].concat(arguments));
}

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost');
        const channel = await connection.createChannel();

        const notificationExchange = 'notification_exchange'; // notificationEx direct
        const notificationQueue = 'notification_queue_process'; // assertQueue direct <--> topic name
        const notificationExchangeDLX = 'notification_exchange_dlx'; // notificationEx direct
        const notificationRoutingKeyDLX = 'notification_routingkey_dlx'; // notificationEx direct 

        // 1. Create Exchange
        await channel.assertExchange(notificationExchange, 'direct', { durable: true });

        // 2, Create Queue
        const queueResult = await channel.assertQueue(notificationQueue, { 
            exclusive: false, // cho phep cac ket noi truy cap vao cung mot luc hang doi
            deadLetterExchange: notificationExchangeDLX,
            deadLetterRoutingKey: notificationRoutingKeyDLX,
            durable: true });

        // 3. Bind Queue to Exchange
        await channel.bindQueue(queueResult.queue, notificationExchange);

        // 4. Send message
        await channel.sendToQueue(queueResult.queue, Buffer.from(messages), {
            expiration: '10000' // 10s
        });

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.log(error);
    }
}

runProducer().catch(console.error);