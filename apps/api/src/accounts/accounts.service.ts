import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Prisma, Account, User } from '@prisma/client';
import type {
  AccountDto,
  AccountType,
  AccountStatus,
  PaginatedResponse,
  UserRole,
} from '@bankcore/contracts';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 20,
    userId?: string,
    type?: string,
    status?: string,
  ): Promise<PaginatedResponse<AccountDto>> {
    const where: Prisma.AccountWhereInput = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;

    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        include: { user: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.account.count({ where }),
    ]);

    return {
      items: accounts.map((a) => this.toDto(a)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findByUser(userId: string): Promise<AccountDto[]> {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return accounts.map((a) => this.toDto(a));
  }

  async findById(id: string): Promise<AccountDto> {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!account) throw new NotFoundException('Account not found');
    return this.toDto(account);
  }

  async create(data: {
    userId: string;
    type: string;
    currency?: string;
    initialDeposit?: number;
  }): Promise<AccountDto> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const account = await this.prisma.account.create({
      data: {
        userId: data.userId,
        type: data.type,
        balance: data.initialDeposit || 0,
        currency: data.currency || 'USD',
        status: 'ACTIVE',
      },
    });
    return this.toDto(account);
  }

  async updateStatus(id: string, status: string): Promise<AccountDto> {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) throw new NotFoundException('Account not found');

    const updated = await this.prisma.account.update({
      where: { id },
      data: { status },
    });
    return this.toDto(updated);
  }

  async verifyOwnership(accountId: string, userId: string): Promise<void> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException('Account not found');
    if (account.userId !== userId) {
      throw new ForbiddenException('You do not own this account');
    }
  }

  private toDto(account: Account & { user?: User }): AccountDto {
    const dto: AccountDto = {
      id: account.id,
      userId: account.userId,
      type: account.type as AccountType,
      balance: account.balance,
      currency: account.currency,
      status: account.status as AccountStatus,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
    if (account.user) {
      dto.user = {
        id: account.user.id,
        email: account.user.email,
        firstName: account.user.firstName,
        lastName: account.user.lastName,
        role: account.user.role as UserRole,
        createdAt: account.user.createdAt.toISOString(),
        updatedAt: account.user.updatedAt.toISOString(),
      };
    }
    return dto;
  }
}
