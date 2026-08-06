import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@bankcore/database';
import { KafkaModule } from '@bankcore/messaging';
import { RabbitMQModule } from '@bankcore/messaging';
import { CommonModule } from '@bankcore/common';
import { bankcoreConfiguration, validateEnvironment } from '@bankcore/config';
import { TransactionsController } from './transactions/transactions.controller.js';
import { TransactionsService } from './transactions/transactions.service.js';
import { LedgerService } from './ledger/ledger.service.js';
import { HealthController } from './health/health.controller.js';
import { BeneficiariesController } from './beneficiaries/beneficiaries.controller.js';
import { BeneficiariesService } from './beneficiaries/beneficiaries.service.js';
import { PaymentsController } from './payments/payments.controller.js';
import { PaymentsService } from './payments/payments.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bankcoreConfiguration],
      validate: validateEnvironment,
      envFilePath: ['.env.local', '.env'],
    }),
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
  controllers: [HealthController, TransactionsController, BeneficiariesController, PaymentsController],
  providers: [TransactionsService, LedgerService, BeneficiariesService, PaymentsService],
})
export class AppModule {}
