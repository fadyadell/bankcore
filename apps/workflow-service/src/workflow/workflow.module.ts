import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '@bankcore/database';
import { AuthModule } from '@bankcore/auth';
import { KafkaModule } from '@bankcore/kafka';
import { FlowableClient } from './flowable.client';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { AuditLogService, GoRulesService } from '@bankcore/common';
import { RejectTransactionDelegate } from './delegates/reject-transaction.delegate';
import { ExecuteTransferDelegate } from './delegates/execute-transfer.delegate';
import { EvaluateLoanRiskDelegate } from './delegates/evaluate-loan-risk.delegate';
import { ApproveLoanDelegate } from './delegates/approve-loan.delegate';
import { RejectLoanDelegate } from './delegates/reject-loan.delegate';
import { VerifyNationalIdDelegate } from './delegates/verify-national-id.delegate';
import { VerifyTaxDelegate } from './delegates/verify-tax.delegate';

@Module({
  imports: [HttpModule, DatabaseModule, AuthModule, KafkaModule],
  controllers: [WorkflowController],
  providers: [
    FlowableClient,
    WorkflowService,
    AuditLogService,
    GoRulesService,
    RejectTransactionDelegate,
    ExecuteTransferDelegate,
    EvaluateLoanRiskDelegate,
    ApproveLoanDelegate,
    RejectLoanDelegate,
    VerifyNationalIdDelegate,
    VerifyTaxDelegate
  ],
})
export class WorkflowModule {}
