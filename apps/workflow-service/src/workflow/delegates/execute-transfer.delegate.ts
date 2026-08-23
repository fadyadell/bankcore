import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { AuditLogService } from '@bankcore/common';

import { KafkaProducerService } from '@bankcore/kafka';

@Injectable()
export class ExecuteTransferDelegate {
  private readonly logger = new Logger(ExecuteTransferDelegate.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async execute(transactionId: string): Promise<void> {
    this.logger.log(`Executing transfer for transaction ${transactionId}`);
    
    const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId }, include: { debitAccount: true } });
    if (!transaction) return;

    await this.prisma.$transaction(async (tx: any) => {
      const accounts = [transaction.debitAccountId!, transaction.creditAccountId!].sort();
      for (const accId of accounts) {
        await tx.$queryRaw`SELECT * FROM "Account" WHERE id = ${accId} FOR UPDATE`;
      }
      
      await tx.account.update({
        where: { id: transaction.debitAccountId! },
        data: { 
          balance: { decrement: transaction.amount },
          availableBalance: { decrement: transaction.amount }
        }
      });
      await tx.account.update({
        where: { id: transaction.creditAccountId! },
        data: { 
          balance: { increment: transaction.amount },
          availableBalance: { increment: transaction.amount }
        }
      });
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'COMPLETED' }
      });
    });

    await this.auditLogService.log({
      entityType: 'TRANSACTION',
      entityId: transactionId,
      action: 'TRANSFER_EXECUTED',
      metadata: { actorId: 'SYSTEM' }
    });

    await this.kafkaProducer.publish('bankcore.transaction.completed', {
      entityId: transactionId,
      debitAccountId: transaction.debitAccountId,
      creditAccountId: transaction.creditAccountId,
      amount: transaction.amount,
      userId: transaction.debitAccount?.userId
    });
  }
}
