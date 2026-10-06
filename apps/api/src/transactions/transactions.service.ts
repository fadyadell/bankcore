import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Prisma, Transaction, Account } from '@prisma/client';
import type {
  TransactionDto,
  TransactionType,
  TransactionStatus,
  PaginatedResponse,
  AccountType,
  AccountStatus,
} from '@bankcore/contracts';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 20,
    accountId?: string,
    type?: string,
    status?: string,
  ): Promise<PaginatedResponse<TransactionDto>> {
    const where: Prisma.TransactionWhereInput = {};
    if (accountId) {
      where.OR = [{ fromAccountId: accountId }, { toAccountId: accountId }];
    }
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { fromAccount: true, toAccount: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items: transactions.map((t) => this.toDto(t)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findByUser(
    userId: string,
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedResponse<TransactionDto>> {
    // Get all of user's account ids
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });
    const accountIds = accounts.map((a) => a.id);

    if (accountIds.length === 0) {
      return { items: [], total: 0, page, pageSize, totalPages: 0 };
    }

    const where = {
      OR: [
        { fromAccountId: { in: accountIds } },
        { toAccountId: { in: accountIds } },
      ],
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { fromAccount: true, toAccount: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items: transactions.map((t) => this.toDto(t)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async deposit(
    accountId: string,
    amount: number,
    reference?: string,
  ): Promise<TransactionDto> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException('Account not found');
    if (account.status !== 'ACTIVE')
      throw new BadRequestException('Account is not active');

    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          toAccountId: accountId,
          amount,
          currency: account.currency,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          reference,
        },
      }),
      this.prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: amount } },
      }),
    ]);

    return this.toDto(transaction);
  }

  async withdraw(
    accountId: string,
    amount: number,
    userId: string,
    reference?: string,
  ): Promise<TransactionDto> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException('Account not found');
    if (account.status !== 'ACTIVE')
      throw new BadRequestException('Account is not active');
    if (account.userId !== userId)
      throw new ForbiddenException('Not your account');
    if (account.balance < amount)
      throw new BadRequestException('Insufficient funds');

    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          fromAccountId: accountId,
          amount,
          currency: account.currency,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          reference,
        },
      }),
      this.prisma.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } },
      }),
    ]);

    return this.toDto(transaction);
  }

  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    userId: string,
    reference?: string,
  ): Promise<TransactionDto> {
    if (fromAccountId === toAccountId) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    const fromAccount = await this.prisma.account.findUnique({
      where: { id: fromAccountId },
    });
    if (!fromAccount) throw new NotFoundException('Source account not found');
    if (fromAccount.status !== 'ACTIVE')
      throw new BadRequestException('Source account is not active');
    if (fromAccount.userId !== userId)
      throw new ForbiddenException('Not your account');
    if (fromAccount.balance < amount)
      throw new BadRequestException('Insufficient funds');

    const toAccount = await this.prisma.account.findUnique({
      where: { id: toAccountId },
    });
    if (!toAccount)
      throw new NotFoundException('Destination account not found');
    if (toAccount.status !== 'ACTIVE')
      throw new BadRequestException('Destination account is not active');

    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          fromAccountId,
          toAccountId,
          amount,
          currency: fromAccount.currency,
          type: 'TRANSFER',
          status: 'COMPLETED',
          reference,
        },
      }),
      this.prisma.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      }),
      this.prisma.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      }),
    ]);

    return this.toDto(transaction);
  }

  private toDto(
    t: Transaction & {
      fromAccount?: Account | null;
      toAccount?: Account | null;
    },
  ): TransactionDto {
    return {
      id: t.id,
      fromAccountId: t.fromAccountId,
      toAccountId: t.toAccountId,
      amount: t.amount,
      currency: t.currency,
      type: t.type as TransactionType,
      status: t.status as TransactionStatus,
      reference: t.reference,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      fromAccount: t.fromAccount
        ? {
            id: t.fromAccount.id,
            userId: t.fromAccount.userId,
            type: t.fromAccount.type as AccountType,
            balance: t.fromAccount.balance,
            currency: t.fromAccount.currency,
            status: t.fromAccount.status as AccountStatus,
            createdAt: t.fromAccount.createdAt.toISOString(),
            updatedAt: t.fromAccount.updatedAt.toISOString(),
          }
        : undefined,
      toAccount: t.toAccount
        ? {
            id: t.toAccount.id,
            userId: t.toAccount.userId,
            type: t.toAccount.type as AccountType,
            balance: t.toAccount.balance,
            currency: t.toAccount.currency,
            status: t.toAccount.status as AccountStatus,
            createdAt: t.toAccount.createdAt.toISOString(),
            updatedAt: t.toAccount.updatedAt.toISOString(),
          }
        : undefined,
    };
  }
}
