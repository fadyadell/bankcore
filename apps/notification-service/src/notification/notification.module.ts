import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { NotificationConsumer } from './notification.consumer';
import { EmailService } from '../channels/email.service';
import { SmsService } from '../channels/sms.service';
import { PrismaModule } from '@bankcore/prisma-client';
import { KafkaModule } from '@bankcore/messaging';

@Module({
  imports: [PrismaModule, KafkaModule],
  controllers: [NotificationController],
  providers: [NotificationService, KafkaConsumerService, NotificationConsumer, EmailService, SmsService],
  exports: [NotificationService],
})
export class NotificationModule {}
