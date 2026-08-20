import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request } from 'express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter, ResponseTransformInterceptor } from '@bankcore/common';

async function bootstrap(): Promise<void> {
  const logger = new Logger('ApiGateway');
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.setGlobalPrefix('api/v1');

  const { createProxyMiddleware } = await import('http-proxy-middleware');
  app.use(
    '/',
    createProxyMiddleware({
      pathFilter: (pathname, req: Request) => !req.originalUrl.startsWith('/api/v1/health') && !req.originalUrl.startsWith('/api/v1/docs'),
      target: 'http://localhost:3000', // default fallback
      changeOrigin: true,
      pathRewrite: { '^/api/v1': '' },
      router: (req: Request) => {
        if (req.originalUrl.startsWith('/api/v1/iam') || req.originalUrl.startsWith('/api/v1/auth') || req.originalUrl.startsWith('/api/v1/users')) return process.env.IAM_SERVICE_URL || 'http://localhost:3001';
        if (req.originalUrl.startsWith('/api/v1/accounts')) return process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3002';
        if (req.originalUrl.startsWith('/api/v1/transactions') || req.originalUrl.startsWith('/api/v1/admin/stats')) return process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3003';
        if (req.originalUrl.startsWith('/api/v1/loans')) return process.env.LOAN_SERVICE_URL || 'http://localhost:3005';
        if (req.originalUrl.startsWith('/api/v1/workflows') || req.originalUrl.startsWith('/api/v1/tasks')) return process.env.WORKFLOW_SERVICE_URL || 'http://localhost:3007';
        if (req.originalUrl.startsWith('/api/v1/notifications')) return process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
        return 'http://localhost:3000'; // Fallback
      },
    }),
  );


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

  app.enableCors({
    origin: process.env['CORS_ORIGIN'] || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('BankCore API')
    .setDescription('BankCore Enterprise Digital Banking Platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter Keycloak JWT token',
        in: 'header',
      },
      'keycloak-jwt',
    )
    .addTag('Health', 'Health check endpoints')
    .addTag('Auth', 'Authentication & authorization')
    .addTag('Users', 'User management')
    .addTag('Accounts', 'Account management')
    .addTag('Transactions', 'Transaction processing')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['API_GATEWAY_PORT'] || 3100;
  await app.listen(port);
  logger.log(`API Gateway running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
