import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { AuditLogService } from '@bankcore/common';
import { LoanStatus } from '@bankcore/database';
import { KafkaProducerService } from '@bankcore/messaging';

@Injectable()
export class ApproveLoanDelegate {
  private readonly logger = new Logger(ApproveLoanDelegate.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async execute(loanId: string): Promise<void> {
    this.logger.log(`Approving loan ${loanId}`);
    
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      this.logger.error(`Loan ${loanId} not found`);
      return;
    }

    this.logger.log(`Found loan ${loanId}, customer ${loan.customerId}`);

    await this.prisma.$transaction(async (tx) => {
      await tx.loan.update({
        where: { id: loanId },
        data: { status: LoanStatus.APPROVED }
      });

      // Find primary account to deposit loan funds
      const account = await tx.account.findFirst({
        where: { customerId: loan.customerId, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' }
      });

      this.logger.log(`Found account for customer ${loan.customerId}: ${account ? account.id : 'NONE'}`);

      if (account) {
        await tx.account.update({
          where: { id: account.id },
          data: {
            balance: { increment: loan.amount },
            availableBalance: { increment: loan.amount }
          }
        });
        
        // Record deposit transaction
        await tx.transaction.create({
          data: {
            referenceNumber: `LOAN-FUND-${Date.now()}`,
            creditAccountId: account.id,
            amount: loan.amount,
            type: 'DEPOSIT',
            currency: account.currency,
            description: `Loan Disbursement - ${loan.purpose}`,
            status: 'COMPLETED'
          }
        });
        this.logger.log(`Deposited loan amount ${loan.amount} into account ${account.id}`);
      }
    });

    await this.auditLogService.log({
      entityType: 'LOAN',
      entityId: loanId,
      action: 'LOAN_APPROVED',
    });

    await this.kafkaProducer.publish('bankcore.loan.approved', { 
      entityId: loanId, 
      customerId: loan.customerId 
    });
  }
}
