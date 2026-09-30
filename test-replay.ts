import { Kafka } from 'kafkajs';
async function replay() {
  const kafka = new Kafka({ clientId: 'replayer', brokers: ['localhost:9092'] });
  const producer = kafka.producer();
  await producer.connect();
  
  await producer.send({
    topic: 'bankcore.transaction.created',
    messages: [
      { value: JSON.stringify({ eventId: 'db4073b1-5c53-42ba-b340-9bf4cca513de', transactionId: '92b0c1aa-2fee-4a48-bcb6-84bcdfab4820' }) }
    ]
  });
  
  await producer.send({
    topic: 'bankcore.loan.applied',
    messages: [
      { value: JSON.stringify({ eventId: 'd6ed476f-9efb-45c9-b87f-8847be423232', loanId: 'cfc64455-b051-4a73-a91d-5f5f9273c9ff' }) }
    ]
  });
  
  await producer.disconnect();
}
replay();
