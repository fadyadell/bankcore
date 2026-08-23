import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Roles } from '@bankcore/common';
import { JwtAuthGuard, RolesGuard } from '@bankcore/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  @Roles('admin')
  async getStats() {
    const totalTransactions = await this.prisma.transaction.count();
    const totalAccounts = await this.prisma.account.count();
    const totalLoans = await this.prisma.loan.count();
    const totalUsers = await this.prisma.user.count();

    const pendingTransactions = await this.prisma.transaction.count({
      where: { status: 'PROCESSING' }
    });

    const pendingLoans = await this.prisma.loan.count({
      where: { status: 'REVIEWING' }
    });

    return {
      totalTransactions,
      totalAccounts,
      totalLoans,
      totalUsers,
      pendingTransactions,
      pendingLoans,
    };
  }
}
