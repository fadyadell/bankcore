require('ts-node/register');
const { TOPICS } = require('../libs/contracts/src/events/topics.ts');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'admin-cli', brokers: ['localhost:9092'] });
const admin = kafka.admin();

async function run() {
  await admin.connect();
  const existingTopics = await admin.listTopics();
  
  // Extract all string values from TOPICS object
  // Note: bankcore.notifications.* topics are temporary pending the Phase 2b redesign.
  // notificationsCustomer function entry is skipped since it's not a string.
  const topicsToCreate = Object.values(TOPICS).filter(t => typeof t === 'string');
  
  const topicsConfig = topicsToCreate
    .filter(t => !existingTopics.includes(t))
    .map(t => ({ topic: t, numPartitions: 1, replicationFactor: 1 }));

  if (topicsConfig.length > 0) {
    try {
      await admin.createTopics({ topics: topicsConfig });
      console.log(`Created topics: ${topicsConfig.map(t => t.topic).join(', ')}`);
    } catch (err) {
      console.error('Error creating topics:', err.message);
    }
  } else {
    console.log('All topics already exist, skipping creation.');
  }
  
  await admin.disconnect();
}
run().catch(err => console.error('Fatal error:', err.message));
