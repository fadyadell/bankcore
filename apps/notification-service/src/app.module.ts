import { Module, type OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@bankcore/prisma-client';
import { RabbitMQModule } from '@bankcore/messaging';
import { CommonModule } from '@bankcore/common';
import { NotificationsService } from './notifications/notifications.service.js';
import { NotificationsController } from './notifications/notifications.controller.js';
import { NotificationConsumer } from './notifications/notification.consumer.js';
import { EmailService } from './channels/email.service.js';
import { SmsService } from './channels/sms.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot(),
    RabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: `amqp://${config.get<string>('RABBITMQ_USER', 'bankcore')}:${config.get<string>('RABBITMQ_PASSWORD', 'bankcore_rabbit')}@${config.get<string>('RABBITMQ_HOST', 'localhost')}:${config.get<number>('RABBITMQ_PORT', 5672)}`,
        exchange: 'bankcore.notifications.exchange',
        queue: 'bankcore.notifications',
        deadLetterExchange: 'bankcore.notifications.dlq.exchange',
        deadLetterQueue: 'bankcore.notifications.dlq',
        prefetchCount: 10,
      }),
    }),
    CommonModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationConsumer,
    EmailService,
    SmsService,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly consumer: NotificationConsumer) {}

  async onModuleInit(): Promise<void> {
    await this.consumer.startConsuming();
  }
}
