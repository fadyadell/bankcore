import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';
import { RedisCacheService } from '@bankcore/cache';
import { KafkaProducerService } from '@bankcore/messaging';
import { generateAccountNumber, KAFKA_TOPICS, CACHE_KEYS, CACHE_TTL } from '@bankcore/common';
import type { Account, AccountType, AccountStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';
import type { CreateAccountDto, UpdateAccountStatusDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    if (!dto.userId) {
      throw new BadRequestException('userId is required');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const accountNumber = generateAccountNumber();

    const account = await this.prisma.account.create({
      data: {
        accountNumber,
        userId: dto.userId,
        type: dto.type as AccountType,
        currency: dto.currency || 'USD',
        balance: new Decimal(0),
        availableBalance: new Decimal(0),
        interestRate: dto.interestRate ? new Decimal(dto.interestRate) : undefined,
        overdraftLimit: dto.overdraftLimit ? new Decimal(dto.overdraftLimit) : undefined,
      },
    });

    await this.kafkaProducer.publish(KAFKA_TOPICS.ACCOUNT_CREATED, {
      eventId: randomUUID(),
      eventType: 'account.created' as const,
      aggregateId: account.id,
      aggregateType: 'Account',
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        accountId: account.id,
        accountNumber: account.accountNumber,
        userId: account.userId,
        type: account.type,
        currency: account.currency,
      },
    });

    this.logger.log(`Account created: ${account.accountNumber} for user ${dto.userId}`);
    return account;
  }

  async findAll(
    page = 1,
    limit = 20,
    userId?: string,
    status?: string,
  ): Promise<{ accounts: Account[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (userId) where['userId'] = userId;
    if (status) where['status'] = status;

    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      }),
      this.prisma.account.count({ where }),
    ]);

    return { accounts, total };
  }

  async findById(id: string): Promise<Account> {
    const cached = await this.cache.get<Account>(CACHE_KEYS.ACCOUNT_DETAIL(id));
    if (cached) return cached;

    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    await this.cache.set(CACHE_KEYS.ACCOUNT_DETAIL(id), account, CACHE_TTL.ACCOUNT_DETAIL);
    return account;
  }

  async getBalance(id: string): Promise<{
    accountId: string;
    accountNumber: string;
    balance: Decimal;
    availableBalance: Decimal;
    currency: string;
  }> {
    const cacheKey = CACHE_KEYS.ACCOUNT_BALANCE(id);
    const cached = await this.cache.get<{
      accountId: string;
      accountNumber: string;
      balance: Decimal;
      availableBalance: Decimal;
      currency: string;
    }>(cacheKey);

    if (cached) return cached;

    const account = await this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        accountNumber: true,
        balance: true,
        availableBalance: true,
        currency: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const result = {
      accountId: account.id,
      accountNumber: account.accountNumber,
      balance: account.balance,
      availableBalance: account.availableBalance,
      currency: account.currency,
    };

    await this.cache.set(cacheKey, result, CACHE_TTL.ACCOUNT_BALANCE);
    return result;
  }

  async updateStatus(id: string, dto: UpdateAccountStatusDto): Promise<Account> {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const previousStatus = account.status;

    if (previousStatus === 'CLOSED') {
      throw new BadRequestException('Cannot change status of a closed account');
    }

    const updateData: Record<string, unknown> = {
      status: dto.status as AccountStatus,
    };

    if (dto.status === 'CLOSED') {
      if (Number(account.balance) !== 0) {
        throw new BadRequestException('Account must have zero balance to close');
      }
      updateData['closedAt'] = new Date();
    }

    const updated = await this.prisma.account.update({
      where: { id },
      data: updateData,
    });

    await this.cache.del(CACHE_KEYS.ACCOUNT_DETAIL(id));
    await this.cache.del(CACHE_KEYS.ACCOUNT_BALANCE(id));

    await this.kafkaProducer.publish(KAFKA_TOPICS.ACCOUNT_STATUS_CHANGED, {
      eventId: randomUUID(),
      eventType: 'account.status_changed' as const,
      aggregateId: id,
      aggregateType: 'Account',
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        accountId: id,
        previousStatus,
        newStatus: dto.status,
        reason: dto.reason,
      },
    });

    this.logger.log(`Account ${id} status changed: ${previousStatus} -> ${dto.status}`);
    return updated;
  }

  async findUserByKeycloakId(keycloakId: string) {
    return this.prisma.user.findUnique({
      where: { keycloakId },
      select: { id: true },
    });
  }
}
