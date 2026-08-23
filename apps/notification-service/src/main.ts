import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter, ResponseTransformInterceptor } from '@bankcore/common';

async function bootstrap(): Promise<void> {
  const logger = new Logger('NotificationService');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  const port = process.env['NOTIFICATION_SERVICE_PORT'] || 3006;
  await app.listen(port);

  // Initialize RabbitMQ Microservice
  const { Transport } = require('@nestjs/microservices');
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'bankcore_queue',
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.startAllMicroservices();

  logger.log(`Notification Service running on http://localhost:${port}`);
}

bootstrap();
