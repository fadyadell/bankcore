import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoanApplicationModule } from './modules/loan-application/loan-application.module';
import { AuthModule } from './modules/auth/auth.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { RulesEngineModule } from './modules/rules-engine/rules-engine.module';
import { WorkflowModule } from './modules/workflow/workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    MessagingModule,
    RulesEngineModule,
    WorkflowModule,
    LoanApplicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
