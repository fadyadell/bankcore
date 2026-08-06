import { Module } from '@nestjs/common';
import { PrismaModule } from '@bankcore/database';
import { LoanApplicationController } from './loan-application.controller';
import { LoanApplicationService } from './loan-application.service';
import { LoanApplicationRepository } from './loan-application.repository';
import { MessagingModule } from '../messaging/messaging.module';
import { RulesEngineModule } from '../rules-engine/rules-engine.module';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [PrismaModule, MessagingModule, RulesEngineModule, WorkflowModule],
  controllers: [LoanApplicationController],
  providers: [LoanApplicationService, LoanApplicationRepository],
  exports: [LoanApplicationService],
})
export class LoanApplicationModule {}
