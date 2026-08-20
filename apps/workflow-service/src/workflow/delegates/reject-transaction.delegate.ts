import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { AuditLogService } from '@bankcore/common';
import { TransactionStatus, ApprovalStage, ApprovalDecision } from '@bankcore/database';
import { KafkaProducerService } from '@bankcore/messaging';

@Injectable()
export class RejectTransactionDelegate {
  private readonly logger = new Logger(RejectTransactionDelegate.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async execute(transactionId: string, reason: string): Promise<void> {
    this.logger.log(`Rejecting transaction ${transactionId} with reason: ${reason}`);
    
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.REJECTED },
    });

    await this.prisma.approval.create({
      data: {
        transactionId: transactionId,
        stage: ApprovalStage.EMPLOYEE_REVIEW,
        decision: ApprovalDecision.REJECTED,
        reason: reason,
        approverId: 'SYSTEM',
      }
    });

    await this.auditLogService.log({
      entityType: 'TRANSACTION',
      entityId: transactionId,
      action: 'TRANSACTION_REJECTED',
    });

    await this.kafkaProducer.publish('bankcore.transaction.rejected', {
      entityId: transactionId,
      reason
    });
  }
}
