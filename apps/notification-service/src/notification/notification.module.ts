import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { NotificationConsumer } from './notification.consumer';
import { EmailService } from '../channels/email.service';
import { SmsService } from '../channels/sms.service';
import { DatabaseModule } from '@bankcore/database';
import { KafkaModule } from '@bankcore/kafka';

import { NotificationRabbitController } from './notification.rabbit.controller';

@Module({
  imports: [DatabaseModule, KafkaModule],
  controllers: [NotificationController, NotificationRabbitController],
  providers: [NotificationService, KafkaConsumerService, NotificationConsumer, EmailService, SmsService],
  exports: [NotificationService],
})
export class NotificationModule {}
