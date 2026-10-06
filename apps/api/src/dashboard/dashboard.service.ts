import { Injectable } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import type {
  DashboardStats,
  CustomerDashboard,
  TransactionType,
  TransactionStatus,
  LoanStatus,
  AccountType,
  AccountStatus,
} from '@bankcore/contracts';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      totalAccounts,
      totalTransactions,
      totalLoans,
      pendingLoans,
      balanceAgg,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.account.count(),
      this.prisma.transaction.count(),
      this.prisma.loan.count(),
      this.prisma.loan.count({ where: { status: 'PENDING' } }),
      this.prisma.account.aggregate({ _sum: { balance: true } }),
    ]);

    return {
      totalUsers,
      totalAccounts,
      totalTransactions,
      totalLoans,
      pendingLoans,
      totalBalance: balanceAgg._sum.balance || 0,
    };
  }

  async getCustomerDashboard(userId: string): Promise<CustomerDashboard> {
    const [accounts, recentTransactionsRaw, activeLoans, unreadNotifications] =
      await Promise.all([
        this.prisma.account.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
        this.getRecentTransactionsForUser(userId),
        this.prisma.loan.findMany({
          where: { userId, status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] } },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.notification.count({ where: { userId, status: 'UNREAD' } }),
      ]);

    return {
      accounts: accounts.map((a) => ({
        id: a.id,
        userId: a.userId,
        type: a.type as AccountType,
        balance: a.balance,
        currency: a.currency,
        status: a.status as AccountStatus,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      recentTransactions: recentTransactionsRaw.map((t) => ({
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
      })),
      activeLoans: activeLoans.map((l) => ({
        id: l.id,
        userId: l.userId,
        amount: l.amount,
        interestRate: l.interestRate,
        termMonths: l.termMonths,
        status: l.status as LoanStatus,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      })),
      unreadNotifications,
    };
  }

  private async getRecentTransactionsForUser(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });
    const accountIds = accounts.map((a) => a.id);
    if (accountIds.length === 0) return [];

    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccountId: { in: accountIds } },
          { toAccountId: { in: accountIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}
