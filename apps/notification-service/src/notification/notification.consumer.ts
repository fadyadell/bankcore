import { Injectable, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { NotificationService } from './notification.service';
import { EmailService } from '../channels/email.service';
import { SmsService } from '../channels/sms.service';


@Injectable()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async startConsuming(): Promise<void> {
    const kafka = new Kafka({
      clientId: 'notification-sender',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    });
    const consumer = kafka.consumer({ groupId: 'notification-sender-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: /bankcore\.notifications.*/, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;
        const payload = JSON.parse(message.value.toString());
        
        // This simulates the notification request event parsing
        const event = {
          eventType: topic,
          payload: {
            userId: payload.targetRole || 'SYSTEM',
            channel: 'PUSH',
            type: payload.type,
            subject: payload.title,
            body: payload.body,
            metadata: payload,
          }
        };

        this.logger.log(
          `Received notification request: ${event.eventType} for user ${event.payload.userId}`,
        );

        const notification = await this.notificationService.create({
          userId: event.payload.userId,
          channel: event.payload.channel,
          type: event.payload.type,
          subject: event.payload.subject,
          body: event.payload.body,
          metadata: event.payload.metadata,
        });

        try {
          let sent = false;

          switch (event.payload.channel) {
            case 'EMAIL':
              sent = await this.emailService.send(
                event.payload.userId,
                event.payload.subject || 'BankCore Notification',
                event.payload.body,
              );
              break;
            case 'SMS':
              sent = await this.smsService.send(
                event.payload.userId,
                event.payload.body,
              );
              break;
            case 'PUSH':
              this.logger.log(`[PUSH] Push notification for user ${event.payload.userId}`);
              sent = true;
              break;
            default:
              this.logger.warn(`Unknown channel: ${event.payload.channel}`);
          }

          if (sent) {
            await this.notificationService.markSent(notification.id);
            this.logger.log(`Notification ${notification.id} sent via ${event.payload.channel}`);
          } else {
            await this.notificationService.markFailed(notification.id, 'Channel returned failure');
          }
        } catch (error) {
          const errorMessage = (error as Error).message;
          await this.notificationService.markFailed(notification.id, errorMessage);
          this.logger.error(`Failed to send notification ${notification.id}: ${errorMessage}`);
        }
      },
    });

    this.logger.log('Notification consumer started');
  }
}
