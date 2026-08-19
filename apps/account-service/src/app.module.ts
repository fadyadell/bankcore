import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@bankcore/prisma-client';
import { CacheModule } from '@bankcore/cache';
import { KafkaModule } from '@bankcore/messaging';
import { AuthModule } from '@bankcore/auth';
import { CommonModule, bankcoreConfiguration, validateEnvironment } from '@bankcore/common';
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
    AuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        keycloakBaseUrl: config.get<string>('KEYCLOAK_BASE_URL', 'http://localhost:8080'),
        keycloakRealm: config.get<string>('KEYCLOAK_REALM', 'bankcore'),
        keycloakClientId: config.get<string>('KEYCLOAK_CLIENT_ID', 'bankcore-api'),
      }),
    }),
    CommonModule,
  ],
  controllers: [HealthController, AccountsController],
  providers: [AccountsService],
})
export class AppModule {}
