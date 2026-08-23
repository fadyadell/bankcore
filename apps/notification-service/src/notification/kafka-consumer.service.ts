import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KafkaProducerService } from '@bankcore/kafka';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private kafka: Kafka;
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(private readonly kafkaProducer: KafkaProducerService) {
    this.kafka = new Kafka({
      clientId: 'notification-service',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    });
  }

  async onModuleInit() {
    try {
      const consumer = this.kafka.consumer({ groupId: 'notification-service' });
      await consumer.connect();
      
      await consumer.subscribe({ topic: /bankcore\..*/, fromBeginning: false });

      await consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;
          const payload = JSON.parse(message.value.toString());
          this.logger.log(`Received Kafka message on ${topic}: ${message.value.toString()}`);

          switch (topic) {
            case 'bankcore.transaction.created':
              await this.kafkaProducer.publish('bankcore.notifications.employee', {
                type: 'TRANSACTION_PENDING',
                title: 'New transaction to review',
                body: `Transaction ${payload.entityId} needs review`,
                targetRole: 'EMPLOYEE'
              });
              break;
            case 'bankcore.transaction.approved':
              await this.kafkaProducer.publish('bankcore.notifications.admin', {
                type: 'TRANSACTION_AWAITING_ADMIN',
                title: 'Transaction awaits admin review',
                body: `Transaction ${payload.entityId} was approved by employee and awaits admin`,
                targetRole: 'ADMIN'
              });
              break;
            case 'bankcore.transaction.completed':
              await this.kafkaProducer.publish(`bankcore.notifications.customer.${payload.customerId}`, {
                type: 'TRANSACTION_COMPLETED',
                title: 'Transfer completed',
                body: `Your transaction ${payload.entityId} has been completed.`
              });
              break;
            case 'bankcore.transaction.rejected':
              if (payload.customerId) {
                await this.kafkaProducer.publish(`bankcore.notifications.customer.${payload.customerId}`, {
                  type: 'TRANSACTION_REJECTED',
                  title: 'Transfer rejected',
                  body: `Your transaction ${payload.entityId} was rejected. Reason: ${payload.reason}`
                });
              }
              break;
            case 'bankcore.loan.applied':
              await this.kafkaProducer.publish('bankcore.notifications.employee', {
                type: 'LOAN_PENDING',
                title: 'New loan applied',
                body: `Loan ${payload.entityId} needs review`,
                targetRole: 'EMPLOYEE'
              });
              break;
            case 'bankcore.loan.approved':
              await this.kafkaProducer.publish(`bankcore.notifications.customer.${payload.customerId}`, {
                type: 'LOAN_APPROVED',
                title: 'Loan Approved',
                body: `Your loan ${payload.entityId} has been approved.`
              });
              break;
            case 'bankcore.loan.rejected':
              if (payload.customerId) {
                await this.kafkaProducer.publish(`bankcore.notifications.customer.${payload.customerId}`, {
                  type: 'LOAN_REJECTED',
                  title: 'Loan Rejected',
                  body: `Your loan ${payload.entityId} was rejected. Reason: ${payload.reason}`
                });
              }
              break;
          }
        },
      });
      this.logger.log('Kafka Consumer initialized');
    } catch (error) {
      this.logger.warn(`Kafka Consumer unavailable (${(error as Error).message}). Notification relay will be degraded.`);
    }
  }
}
