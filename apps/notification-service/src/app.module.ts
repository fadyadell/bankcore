import { Module, type OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@bankcore/database';
import { RabbitMQModule } from '@bankcore/messaging';
import { CommonModule } from '@bankcore/common';
import { bankcoreConfiguration, validateEnvironment } from '@bankcore/config';
import { NotificationsService } from './notifications/notifications.service.js';
import { NotificationsController } from './notifications/notifications.controller.js';
import { NotificationConsumer } from './notifications/notification.consumer.js';
import { EmailService } from './channels/email.service.js';
import { SmsService } from './channels/sms.service.js';
import { HealthController } from './health/health.controller.js';
import { StatementsController } from './statements/statements.controller.js';
import { StatementsService } from './statements/statements.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bankcoreConfiguration],
      validate: validateEnvironment,
      envFilePath: ['.env.local', '.env'],
    }),
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
  controllers: [HealthController, NotificationsController, StatementsController],
  providers: [
    NotificationsService,
    NotificationConsumer,
    EmailService,
    SmsService,
    StatementsService,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly consumer: NotificationConsumer) {}

  async onModuleInit(): Promise<void> {
    await this.consumer.startConsuming();
  }
}
