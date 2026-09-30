import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { NotificationService } from './notification.service';
import { EmailService } from '../channels/email.service';
import { SmsService } from '../channels/sms.service';
import { TOPICS } from '@bankcore/contracts';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async onModuleInit() {
    this.startConsuming().catch(err => this.logger.error('Error starting consumer', err));
  }

  async startConsuming(): Promise<void> {
    const kafka = new Kafka({
      clientId: 'notification-sender',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    });
    const consumer = kafka.consumer({ groupId: 'notification-sender-group' });
    await consumer.connect();
    
    const topics = [
      TOPICS.TRANSACTION_CREATED,
      TOPICS.TRANSACTION_APPROVED,
      TOPICS.TRANSACTION_COMPLETED,
      TOPICS.TRANSACTION_REJECTED,
      TOPICS.LOAN_APPLIED,
      TOPICS.LOAN_APPROVED,
      TOPICS.LOAN_REJECTED,
    ];

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) return;
          const payload = JSON.parse(message.value.toString());
          const eventId = payload.eventId;
          
          this.logger.log(`Handling message from topic ${topic}, partition ${partition}, offset ${message.offset}`);
          
          let userIds: string[] = [];
          let notificationType = 'SYSTEM';
          let notificationSubject = 'System Notification';
          let notificationBody = 'System event occurred';

          if (topic === TOPICS.TRANSACTION_CREATED || topic === TOPICS.LOAN_APPLIED) {
            const roleUsers = await this.notificationService.prisma.user.findMany({
              where: { role: 'EMPLOYEE', status: 'ACTIVE' }
            });
            userIds = roleUsers.map(u => u.id);
            notificationType = topic === TOPICS.TRANSACTION_CREATED ? 'TRANSACTION_PENDING' : 'LOAN_PENDING';
            notificationSubject = 'New event needs review';
            notificationBody = `Event ${topic} occurred for entity ${payload.transactionId || payload.loanId || payload.entityId} and needs review`;
          } else if (topic === TOPICS.TRANSACTION_APPROVED) {
            const roleUsers = await this.notificationService.prisma.user.findMany({
              where: { role: 'ADMIN', status: 'ACTIVE' }
            });
            userIds = roleUsers.map(u => u.id);
            notificationType = 'TRANSACTION_AWAITING_ADMIN';
            notificationSubject = 'Transaction awaits admin review';
            notificationBody = `Transaction ${payload.transactionId || payload.entityId} was approved by employee and awaits admin`;
          } else {
            // other outcomes -> the customer User.id in the payload
            if (payload.userId) {
              userIds = [payload.userId];
            } else if (payload.customerId) {
              userIds = [payload.customerId];
            }
            
            if (topic === TOPICS.TRANSACTION_COMPLETED) {
              notificationType = 'TRANSACTION_COMPLETED';
              notificationSubject = 'Transfer completed';
              notificationBody = `Your transaction ${payload.transactionId || payload.entityId} has been completed.`;
            } else if (topic === TOPICS.TRANSACTION_REJECTED) {
              notificationType = 'TRANSACTION_REJECTED';
              notificationSubject = 'Transfer rejected';
              notificationBody = `Your transaction ${payload.transactionId || payload.entityId} was rejected. Reason: ${payload.reason || 'Unknown'}`;
            } else if (topic === TOPICS.LOAN_APPROVED) {
              notificationType = 'LOAN_APPROVED';
              notificationSubject = 'Loan Approved';
              notificationBody = `Your loan ${payload.loanId || payload.entityId} has been approved.`;
            } else if (topic === TOPICS.LOAN_REJECTED) {
              notificationType = 'LOAN_REJECTED';
              notificationSubject = 'Loan Rejected';
              notificationBody = `Your loan ${payload.loanId || payload.entityId} was rejected. Reason: ${payload.reason || 'Unknown'}`;
            }
          }

          if (userIds.length === 0) {
            this.logger.warn(`No active users found to notify for topic: ${topic}`);
            return;
          }

          for (const finalUserId of userIds) {
            try {
              const notification = await this.notificationService.prisma.notification.create({
                data: {
                  eventId: eventId || null,
                  userId: finalUserId,
                  channel: 'EMAIL', // Fallback, normally might vary
                  type: notificationType,
                  subject: notificationSubject,
                  body: notificationBody,
                  metadata: payload,
                }
              });

              let sent = false;
              try {
                // For simplicity, just use Email for all in this mock
                sent = await this.emailService.send(
                  finalUserId,
                  notificationSubject,
                  notificationBody,
                );
              } catch (err) {
                this.logger.error(`Failed to send email: ${(err as Error).message}`);
              }

              if (sent) {
                await this.notificationService.markSent(notification.id);
                this.logger.log(`Notification ${notification.id} sent to user ${finalUserId}`);
              } else {
                await this.notificationService.markFailed(notification.id, 'Channel returned failure');
              }
            } catch (error: any) {
              // Catch unique constraint violations for eventId + userId
              if (error.code === 'P2002') {
                this.logger.log(`Duplicate notification skipped for eventId ${eventId} and user ${finalUserId}`);
              } else {
                this.logger.error(`Error saving notification for user ${finalUserId}: ${error.message}`);
              }
            }
          }
        } catch (error) {
          this.logger.error(`Error parsing or handling message: ${(error as Error).message}`);
        }
      },
    });

    this.logger.log('Notification consumer started');
  }
}
