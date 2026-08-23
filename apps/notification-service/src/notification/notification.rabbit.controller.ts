import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationRabbitController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('notification.requested')
  async handleNotificationRequested(@Payload() data: any) {
    console.log('Received RabbitMQ command: notification.requested', data);
    await this.notificationService.create({
      userId: data.aggregateId,
      channel: 'PUSH',
      type: data.eventType,
      subject: 'Transaction Notification',
      body: `Transaction event: ${data.eventType}`,
      metadata: data,
    });
    return { success: true };
  }
}
