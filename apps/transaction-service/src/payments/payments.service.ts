import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Payment } from '@prisma/client';
import { generateReferenceNumber } from '@bankcore/common';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreatePaymentDto {
  userId: string;
  accountId: string;
  amount: number;
  currency?: string;
  billerName: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId }
    });
    if (!account) throw new NotFoundException('Account not found');

    const amount = new Decimal(dto.amount);
    
    // Mock Payment creation. In a real system, we'd interact with a biller gateway.
    const payment = await this.prisma.payment.create({
      data: {
        userId: dto.userId,
        accountId: dto.accountId,
        amount,
        currency: dto.currency || account.currency,
        billerName: dto.billerName,
        referenceNumber: generateReferenceNumber('PAY'),
        status: 'COMPLETED',
        processedAt: new Date()
      }
    });

    // We can also create a transaction record to reflect balance deduction.
    const transaction = await this.prisma.transaction.create({
      data: {
        referenceNumber: payment.referenceNumber,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        amount,
        currency: payment.currency,
        description: `Payment to ${dto.billerName}`,
        debitAccountId: dto.accountId,
        processedAt: new Date()
      }
    });

    await this.prisma.ledgerEntry.create({
      data: {
        transactionId: transaction.id,
        accountId: dto.accountId,
        entryType: 'DEBIT',
        amount,
        balanceAfter: account.balance.sub(amount)
      }
    });

    await this.prisma.account.update({
      where: { id: dto.accountId },
      data: {
        balance: account.balance.sub(amount),
        availableBalance: account.availableBalance.sub(amount)
      }
    });

    return payment;
  }

  async findAll(userId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
