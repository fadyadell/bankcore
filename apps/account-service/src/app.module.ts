import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@bankcore/database';
import { CacheModule } from '@bankcore/cache';
import { KafkaModule } from '@bankcore/messaging';
import { CommonModule } from '@bankcore/common';
import { bankcoreConfiguration, validateEnvironment } from '@bankcore/config';
import { AccountsController } from './accounts/accounts.controller.js';
import { AccountsService } from './accounts/accounts.service.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bankcoreConfiguration],
      validate: validateEnvironment,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule.forRoot(),
    CacheModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: config.get<number>('REDIS_PORT', 6379),
        password: config.get<string>('REDIS_PASSWORD'),
        keyPrefix: 'bankcore:accounts:',
        defaultTtl: 60,
      }),
    }),
    KafkaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        brokers: [config.get<string>('KAFKA_BROKER', 'localhost:9092')],
        clientId: 'account-service',
        groupId: config.get<string>('KAFKA_GROUP_ID', 'bankcore-consumers'),
      }),
    }),
    CommonModule,
  ],
  controllers: [HealthController, AccountsController],
  providers: [AccountsService],
})
export class AppModule {}
