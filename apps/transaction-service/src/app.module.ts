import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@bankcore/prisma-client';
import { KafkaModule } from '@bankcore/messaging';
import { RabbitMQModule } from '@bankcore/messaging';
import { CommonModule } from '@bankcore/common';
import { TransactionsController } from './transactions/transactions.controller.js';
import { TransactionsService } from './transactions/transactions.service.js';
import { LedgerService } from './ledger/ledger.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot(),
    KafkaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        brokers: [config.get<string>('KAFKA_BROKER', 'localhost:9092')],
        clientId: 'transaction-service',
        groupId: config.get<string>('KAFKA_GROUP_ID', 'bankcore-consumers'),
      }),
    }),
    RabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: `amqp://${config.get<string>('RABBITMQ_USER', 'bankcore')}:${config.get<string>('RABBITMQ_PASSWORD', 'bankcore_rabbit')}@${config.get<string>('RABBITMQ_HOST', 'localhost')}:${config.get<number>('RABBITMQ_PORT', 5672)}`,
        exchange: 'bankcore.notifications.exchange',
        queue: 'bankcore.notifications',
        deadLetterExchange: 'bankcore.notifications.dlq.exchange',
        deadLetterQueue: 'bankcore.notifications.dlq',
      }),
    }),
    CommonModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, LedgerService],
})
export class AppModule {}
