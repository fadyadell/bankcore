import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './notification.consumer';
import { EmailService } from '../channels/email.service';
import { SmsService } from '../channels/sms.service';
import { DatabaseModule } from '@bankcore/database';
import { KafkaModule } from '@bankcore/kafka';

@Module({
  imports: [DatabaseModule, KafkaModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationConsumer, EmailService, SmsService],
  exports: [NotificationService],
})
export class NotificationModule {}
