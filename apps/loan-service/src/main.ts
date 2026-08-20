import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Default port for loan-service as per project requirements
  const port = process.env.LOAN_SERVICE_PORT || 3005;
  await app.listen(port);
  console.log(`Loan Service running on port ${port}`);
}
bootstrap();
