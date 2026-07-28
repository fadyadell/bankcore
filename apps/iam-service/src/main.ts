import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter, ResponseTransformInterceptor } from '@bankcore/common';

async function bootstrap(): Promise<void> {
  const logger = new Logger('IamService');
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

  const port = process.env['IAM_SERVICE_PORT'] || 3001;
  await app.listen(port);
  logger.log(`IAM Service running on http://localhost:${port}`);
}

bootstrap();
