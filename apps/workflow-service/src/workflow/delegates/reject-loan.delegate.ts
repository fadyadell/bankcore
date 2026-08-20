import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { AuditLogService } from '@bankcore/common';
import { LoanStatus, ApprovalStage, ApprovalDecision } from '@bankcore/database';
import { KafkaProducerService } from '@bankcore/messaging';

@Injectable()
export class RejectLoanDelegate {
  private readonly logger = new Logger(RejectLoanDelegate.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async execute(loanId: string): Promise<void> {
    this.logger.log(`Rejecting loan ${loanId}`);
    
    await this.prisma.loan.update({
      where: { id: loanId },
      data: { status: LoanStatus.REJECTED }
    });

    await this.prisma.approval.create({
      data: {
        loanId: loanId,
        stage: ApprovalStage.EMPLOYEE_REVIEW,
        decision: ApprovalDecision.REJECTED,
        reason: 'SLA_TIMEOUT or Auto Rejected',
        approverId: 'SYSTEM',
      }
    });

    await this.auditLogService.log({
      entityType: 'LOAN',
      entityId: loanId,
      action: 'LOAN_REJECTED',
    });

    await this.kafkaProducer.publish('bankcore.loan.rejected', { 
      entityId: loanId, 
      reason: 'SLA_TIMEOUT or Auto Rejected' 
    });
  }
}
