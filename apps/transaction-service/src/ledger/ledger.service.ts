import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import type { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(prisma: PrismaService) {}

  async recordDebit(
    transactionId: string,
    accountId: string,
    amount: Decimal,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const account = await tx.account.findUniqueOrThrow({
      where: { id: accountId },
    });

    const balanceAfter = account.balance.sub(amount);



    await tx.account.update({
      where: { id: accountId },
      data: {
        balance: balanceAfter,
        availableBalance: balanceAfter,
      },
    });

    this.logger.debug(
      `Debit ledger entry: account=${accountId}, amount=${amount}, balanceAfter=${balanceAfter}`,
    );
  }

  async recordCredit(
    transactionId: string,
    accountId: string,
    amount: Decimal,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const account = await tx.account.findUniqueOrThrow({
      where: { id: accountId },
    });

    const balanceAfter = account.balance.add(amount);



    await tx.account.update({
      where: { id: accountId },
      data: {
        balance: balanceAfter,
        availableBalance: balanceAfter,
      },
    });

    this.logger.debug(
      `Credit ledger entry: account=${accountId}, amount=${amount}, balanceAfter=${balanceAfter}`,
    );
  }
}
