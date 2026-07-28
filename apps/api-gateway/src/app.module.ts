import { Module, type NestModule, type MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from '@bankcore/common';
import { AuthModule } from '@bankcore/auth';
import { CacheModule } from '@bankcore/cache';
import { CorrelationIdMiddleware, RequestLoggingMiddleware } from '@bankcore/common';
import { HealthController } from './health/health.controller.js';
import { AuthProxyController } from './proxy/auth-proxy.controller.js';
import { UsersProxyController } from './proxy/users-proxy.controller.js';
import { AccountsProxyController } from './proxy/accounts-proxy.controller.js';
import { TransactionsProxyController } from './proxy/transactions-proxy.controller.js';
import { ProxyService } from './proxy/proxy.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 60000),
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
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
    CacheModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: config.get<number>('REDIS_PORT', 6379),
        password: config.get<string>('REDIS_PASSWORD'),
        keyPrefix: 'bankcore:gateway:',
        defaultTtl: 300,
      }),
    }),
    CommonModule,
  ],
  controllers: [
    HealthController,
    AuthProxyController,
    UsersProxyController,
    AccountsProxyController,
    TransactionsProxyController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ProxyService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
