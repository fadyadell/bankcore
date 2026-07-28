import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware.js';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware.js';

@Module({
  providers: [],
  exports: [],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
