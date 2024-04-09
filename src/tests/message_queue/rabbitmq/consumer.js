const amqp = require('amqplib');

const runConsumer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost');
        const channel = await connection.createChannel();

        const queueName = 'topic_queue';
        await channel.assertQueue(queueName, { durable: true });

        // send messages to consumer channel 
        channel.consume(queueName, (messages) => {
            console.log(`Received messages: ${messages.content}`);
        }, {
            noAck: true, // true thi neu message da duoc su ly thi khong consume nua
        });
    } catch (error) {
        console.log(error);
    }
}

runConsumer().catch(console.error);