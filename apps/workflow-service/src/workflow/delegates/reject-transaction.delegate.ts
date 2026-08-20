import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';
import { AuditLogService } from '@bankcore/common';

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
      data: { status: 'FAILED' },
    });

    await this.prisma.approval.create({
      data: {
        entityType: 'TRANSACTION',
        entityId: transactionId,
        role: 'EMPLOYEE_REVIEW',
        status: 'REJECTED',
        comments: reason,
        reviewerId: 'SYSTEM',
      }
    });

    await this.auditLogService.log({
      entityType: 'TRANSACTION',
      entityId: transactionId,
      action: 'TRANSACTION_REJECTED',
      metadata: { actorId: 'SYSTEM', after: { reason } }
    });

    await this.kafkaProducer.publish('bankcore.transaction.rejected', {
      entityId: transactionId,
      reason
    });
  }
}
