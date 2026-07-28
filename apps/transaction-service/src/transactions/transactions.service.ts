import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';
import { KafkaProducerService, RabbitMQProducerService } from '@bankcore/messaging';
import {
  generateReferenceNumber,
  KAFKA_TOPICS,
  ERROR_CODES,
} from '@bankcore/common';
import type { Transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';
import { LedgerService } from '../ledger/ledger.service.js';
import type { DepositDto, WithdrawalDto, TransferDto } from './dto/transaction.dto.js';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly rabbitProducer: RabbitMQProducerService,
  ) {}

  async deposit(dto: DepositDto): Promise<Transaction> {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        if (existing.status === 'COMPLETED') return existing;
        throw new ConflictException({
          message: 'Transaction with this idempotency key already exists',
          error: ERROR_CODES.IDEMPOTENCY_CONFLICT,
        });
      }
    }

    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });

    if (!account) throw new NotFoundException('Account not found');
    if (account.status !== 'ACTIVE') {
      throw new BadRequestException({
        message: `Account is ${account.status.toLowerCase()}`,
        error: ERROR_CODES.ACCOUNT_FROZEN,
      });
    }

    const referenceNumber = generateReferenceNumber('DEP');
    const amount = new Decimal(dto.amount);

    const transaction = await this.prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.create({
        data: {
          referenceNumber,
          idempotencyKey: dto.idempotencyKey,
          type: 'DEPOSIT',
          status: 'PROCESSING',
          amount,
          currency: dto.currency || account.currency,
          description: dto.description || 'Deposit',
          creditAccountId: dto.accountId,
        },
      });

      await this.ledger.recordCredit(txn.id, dto.accountId, amount, tx);

      return tx.transaction.update({
        where: { id: txn.id },
        data: { status: 'COMPLETED', processedAt: new Date() },
      });
    });

    await this.publishTransactionCompleted(transaction);
    await this.requestNotification(account.userId, transaction, 'deposit');

    this.logger.log(`Deposit completed: ${referenceNumber} amount=${dto.amount}`);
    return transaction;
  }

  async withdrawal(dto: WithdrawalDto): Promise<Transaction> {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        if (existing.status === 'COMPLETED') return existing;
        throw new ConflictException({
          message: 'Transaction with this idempotency key already exists',
          error: ERROR_CODES.IDEMPOTENCY_CONFLICT,
        });
      }
    }

    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });

    if (!account) throw new NotFoundException('Account not found');
    if (account.status !== 'ACTIVE') {
      throw new BadRequestException({
        message: `Account is ${account.status.toLowerCase()}`,
        error: ERROR_CODES.ACCOUNT_FROZEN,
      });
    }

    const amount = new Decimal(dto.amount);
    const overdraftLimit = account.overdraftLimit || new Decimal(0);
    const availableWithOverdraft = account.availableBalance.add(overdraftLimit);

    if (amount.greaterThan(availableWithOverdraft)) {
      throw new BadRequestException({
        message: 'Insufficient balance',
        error: ERROR_CODES.INSUFFICIENT_BALANCE,
      });
    }

    const referenceNumber = generateReferenceNumber('WDR');

    const transaction = await this.prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.create({
        data: {
          referenceNumber,
          idempotencyKey: dto.idempotencyKey,
          type: 'WITHDRAWAL',
          status: 'PROCESSING',
          amount,
          currency: dto.currency || account.currency,
          description: dto.description || 'Withdrawal',
          debitAccountId: dto.accountId,
        },
      });

      await this.ledger.recordDebit(txn.id, dto.accountId, amount, tx);

      return tx.transaction.update({
        where: { id: txn.id },
        data: { status: 'COMPLETED', processedAt: new Date() },
      });
    });

    await this.publishTransactionCompleted(transaction);
    await this.requestNotification(account.userId, transaction, 'withdrawal');

    this.logger.log(`Withdrawal completed: ${referenceNumber} amount=${dto.amount}`);
    return transaction;
  }

  async transfer(dto: TransferDto): Promise<Transaction> {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException({
        message: 'Cannot transfer to the same account',
        error: ERROR_CODES.SAME_ACCOUNT_TRANSFER,
      });
    }

    if (dto.idempotencyKey) {
      const existing = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        if (existing.status === 'COMPLETED') return existing;
        throw new ConflictException({
          message: 'Transaction with this idempotency key already exists',
          error: ERROR_CODES.IDEMPOTENCY_CONFLICT,
        });
      }
    }

    const [fromAccount, toAccount] = await Promise.all([
      this.prisma.account.findUnique({ where: { id: dto.fromAccountId } }),
      this.prisma.account.findUnique({ where: { id: dto.toAccountId } }),
    ]);

    if (!fromAccount) throw new NotFoundException('Source account not found');
    if (!toAccount) throw new NotFoundException('Destination account not found');

    if (fromAccount.status !== 'ACTIVE') {
      throw new BadRequestException({
        message: `Source account is ${fromAccount.status.toLowerCase()}`,
        error: ERROR_CODES.ACCOUNT_FROZEN,
      });
    }
    if (toAccount.status !== 'ACTIVE') {
      throw new BadRequestException({
        message: `Destination account is ${toAccount.status.toLowerCase()}`,
        error: ERROR_CODES.ACCOUNT_FROZEN,
      });
    }

    if (fromAccount.currency !== toAccount.currency) {
      throw new BadRequestException({
        message: 'Currency mismatch between accounts',
        error: ERROR_CODES.CURRENCY_MISMATCH,
      });
    }

    const amount = new Decimal(dto.amount);
    const overdraftLimit = fromAccount.overdraftLimit || new Decimal(0);
    const availableWithOverdraft = fromAccount.availableBalance.add(overdraftLimit);

    if (amount.greaterThan(availableWithOverdraft)) {
      throw new BadRequestException({
        message: 'Insufficient balance',
        error: ERROR_CODES.INSUFFICIENT_BALANCE,
      });
    }

    const referenceNumber = generateReferenceNumber('TRF');

    const transaction = await this.prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.create({
        data: {
          referenceNumber,
          idempotencyKey: dto.idempotencyKey,
          type: 'TRANSFER',
          status: 'PROCESSING',
          amount,
          currency: dto.currency || fromAccount.currency,
          description: dto.description || `Transfer to ${toAccount.accountNumber}`,
          debitAccountId: dto.fromAccountId,
          creditAccountId: dto.toAccountId,
        },
      });

      await this.ledger.recordDebit(txn.id, dto.fromAccountId, amount, tx);
      await this.ledger.recordCredit(txn.id, dto.toAccountId, amount, tx);

      return tx.transaction.update({
        where: { id: txn.id },
        data: { status: 'COMPLETED', processedAt: new Date() },
      });
    });

    await this.publishTransactionCompleted(transaction);
    await this.requestNotification(fromAccount.userId, transaction, 'transfer_sent');
    await this.requestNotification(toAccount.userId, transaction, 'transfer_received');

    this.logger.log(`Transfer completed: ${referenceNumber} amount=${dto.amount}`);
    return transaction;
  }

  async findAll(
    page = 1,
    limit = 20,
    accountId?: string,
    status?: string,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (accountId) {
      where['OR'] = [
        { debitAccountId: accountId },
        { creditAccountId: accountId },
      ];
    }
    if (status) where['status'] = status;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  async findById(id: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        debitAccount: { select: { accountNumber: true, userId: true } },
        creditAccount: { select: { accountNumber: true, userId: true } },
        ledgerEntries: true,
      },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  private async publishTransactionCompleted(transaction: Transaction): Promise<void> {
    try {
      await this.kafkaProducer.publish(KAFKA_TOPICS.TRANSACTION_COMPLETED, {
        eventId: randomUUID(),
        eventType: 'transaction.completed' as const,
        aggregateId: transaction.id,
        aggregateType: 'Transaction',
        timestamp: new Date().toISOString(),
        version: 1,
        payload: {
          transactionId: transaction.id,
          referenceNumber: transaction.referenceNumber,
          type: transaction.type,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          debitAccountId: transaction.debitAccountId,
          creditAccountId: transaction.creditAccountId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to publish Kafka event: ${(error as Error).message}`);
    }
  }

  private async requestNotification(
    userId: string,
    transaction: Transaction,
    type: string,
  ): Promise<void> {
    try {
      await this.rabbitProducer.publish('notification.requested', {
        eventId: randomUUID(),
        eventType: 'notification.requested',
        aggregateId: transaction.id,
        aggregateType: 'Transaction',
        timestamp: new Date().toISOString(),
        version: 1,
        payload: {
          userId,
          channel: 'EMAIL',
          type,
          subject: `Transaction ${transaction.type} - ${transaction.referenceNumber}`,
          body: `Your ${transaction.type.toLowerCase()} of ${transaction.currency} ${transaction.amount} has been completed. Reference: ${transaction.referenceNumber}`,
          metadata: {
            transactionId: transaction.id,
            referenceNumber: transaction.referenceNumber,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to publish notification: ${(error as Error).message}`);
    }
  }
}
