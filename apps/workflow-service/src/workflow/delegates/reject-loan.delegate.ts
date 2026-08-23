import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { AuditLogService } from '@bankcore/common';

import { KafkaProducerService } from '@bankcore/kafka';

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
      data: { status: 'REJECTED' }
    });

    await this.prisma.approval.create({
      data: {
        entityType: 'LOAN',
        entityId: loanId,
        role: 'EMPLOYEE_REVIEW',
        status: 'REJECTED',
        comments: 'SLA_TIMEOUT or Auto Rejected',
        reviewerId: 'SYSTEM',
      }
    });

    await this.auditLogService.log({
      entityType: 'LOAN',
      entityId: loanId,
      action: 'LOAN_REJECTED',
      metadata: { actorId: 'SYSTEM' }
    });

    await this.kafkaProducer.publish('bankcore.loan.rejected', { 
      entityId: loanId, 
      reason: 'SLA_TIMEOUT or Auto Rejected' 
    });
  }
}
