import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { generateReferenceNumber } from '@bankcore/common';

@Injectable()
export class StatementsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateStatement(accountId: string, startDate: Date, endDate: Date) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [{ debitAccountId: accountId }, { creditAccountId: accountId }],
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const statementId = generateReferenceNumber('STMT');
    
    // In a real system, generate a PDF/CSV and store in S3, returning the URL.
    // Here we just return the raw data object as a mock statement.
    return {
      statementId,
      accountId,
      accountNumber: account.accountNumber,
      currency: account.currency,
      period: { startDate, endDate },
      transactions,
      generatedAt: new Date(),
      downloadUrl: `/api/statements/download/${statementId}` // Mock URL
    };
  }
}
