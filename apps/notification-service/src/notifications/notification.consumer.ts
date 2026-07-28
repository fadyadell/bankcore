import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQConsumerService } from '@bankcore/messaging';
import { NotificationsService } from './notifications.service.js';
import { EmailService } from '../channels/email.service.js';
import { SmsService } from '../channels/sms.service.js';
import type { NotificationRequestedEvent } from '@bankcore/common';

@Injectable()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly rabbitConsumer: RabbitMQConsumerService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async startConsuming(): Promise<void> {
    await this.rabbitConsumer.consume(
      'bankcore.notifications',
      ['notification.requested', 'notification.#'],
      async (message) => {
        const event = message.content as NotificationRequestedEvent;
        this.logger.log(
          `Received notification request: ${event.eventType} for user ${event.payload.userId}`,
        );

        const notification = await this.notificationsService.create({
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
            await this.notificationsService.markSent(notification.id);
            this.logger.log(`Notification ${notification.id} sent via ${event.payload.channel}`);
          } else {
            await this.notificationsService.markFailed(notification.id, 'Channel returned failure');
          }
        } catch (error) {
          const errorMessage = (error as Error).message;
          await this.notificationsService.markFailed(notification.id, errorMessage);
          this.logger.error(`Failed to send notification ${notification.id}: ${errorMessage}`);
        }
      },
    );

    this.logger.log('Notification consumer started');
  }
}
