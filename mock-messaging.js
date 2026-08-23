const fs = require('fs');

// Mock Kafka Producer
const kafkaProducerPath = 'libs/kafka/src/kafka.producer.ts';
let kafkaContent = fs.readFileSync(kafkaProducerPath, 'utf8');
kafkaContent = kafkaContent.replace('await this.client.connect();', '// await this.client.connect(); /* Mocked for POC */');
kafkaContent = kafkaContent.replace('this.client.emit(topic, event);', 'this.logger.log(`[MOCK KAFKA] Emitting event to ${topic}`);');
fs.writeFileSync(kafkaProducerPath, kafkaContent, 'utf8');

// Mock RabbitMQ Client
const rmqClientPath = 'libs/rabbitmq/src/rabbitmq.client.ts';
let rmqContent = fs.readFileSync(rmqClientPath, 'utf8');
rmqContent = rmqContent.replace('return firstValueFrom(this.client.send(pattern, data));', 'this.logger.log(`[MOCK RABBITMQ] Sending ${pattern}`); return Promise.resolve({ success: true });');
fs.writeFileSync(rmqClientPath, rmqContent, 'utf8');

// Disable RabbitMQ Consumer in Notification Service
const notifMainPath = 'apps/notification-service/src/main.ts';
let notifContent = fs.readFileSync(notifMainPath, 'utf8');
notifContent = notifContent.replace(/app\.connectMicroservice[\s\S]*?options:\s*\{[\s\S]*?\}[\s\S]*?\n\s*\};/g, '/* RabbitMQ Consumer mocked out */');
notifContent = notifContent.replace(/app\.connectMicroservice[\s\S]*?\);/g, '/* RabbitMQ Consumer mocked out */');
notifContent = notifContent.replace('await app.startAllMicroservices();', '// await app.startAllMicroservices();');
fs.writeFileSync(notifMainPath, notifContent, 'utf8');

console.log('Messaging mocked out successfully!');
