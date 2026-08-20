import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware';

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
