const amqp = require('amqplib');

const messages = 'RabbitMQ Producer Publish New Message ABCABC';

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost');
        const channel = await connection.createChannel();

        const queueName = 'topic_queue';
        await channel.assertQueue(queueName, { durable: true });

        // send messages to consumer channel 
        await channel.sendToQueue(queueName, Buffer.from(messages));

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.log(error);
    }
}

runProducer().catch(console.error);