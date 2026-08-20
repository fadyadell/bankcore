import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Roles, ResponseDto } from '@bankcore/common';
import { KeycloakAuthGuard, RolesGuard } from '@bankcore/auth';
import { UserRole } from '@bankcore/database';

@UseGuards(KeycloakAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN)
  async getStats() {
    const totalTransactions = await this.prisma.transaction.count();
    const totalAccounts = await this.prisma.account.count();
    const totalLoans = await this.prisma.loan.count();
    const totalUsers = await this.prisma.user.count();

    const pendingTransactions = await this.prisma.transaction.count({
      where: { status: 'ADMIN_REVIEW' }
    });

    const pendingLoans = await this.prisma.loan.count({
      where: { status: 'ADMIN_REVIEW' }
    });

    return ResponseDto.success({
      totalTransactions,
      totalAccounts,
      totalLoans,
      totalUsers,
      pendingTransactions,
      pendingLoans,
    });
  }
}
