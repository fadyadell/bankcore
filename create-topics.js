const { Kafka } = require('kafkajs');
const kafka = new Kafka({ clientId: 'admin-cli', brokers: ['localhost:9092'] });
const admin = kafka.admin();
async function run() {
  await admin.connect();
  const topics = [
    'bankcore.domain.events',
    'bankcore.loan.approved',
    'bankcore.loan.rejected',
    'bankcore.transaction.approved',
    'bankcore.transaction.rejected',
    'bankcore.transaction.completed'
  ];
  await admin.createTopics({
    topics: topics.map(t => ({ topic: t, numPartitions: 1, replicationFactor: 1 }))
  });
  console.log('Topics created');
  await admin.disconnect();
}
run().catch(console.error);
