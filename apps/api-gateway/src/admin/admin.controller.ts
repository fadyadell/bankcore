import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';
import { RolesGuard, Roles, JwtAuthGuard } from '@bankcore/auth';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth('keycloak-jwt')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Get global stats for admin dashboard' })
  async getStats() {
    const [
      totalUsers,
      totalAccounts,
      totalTransactions,
      pendingTransactions,
      totalLoans,
      pendingLoans,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.account.count(),
      this.prisma.transaction.count(),
      this.prisma.transaction.count({ where: { status: 'PENDING' } }),
      this.prisma.loan.count(),
      this.prisma.loan.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      totalAccounts,
      totalTransactions,
      pendingTransactions,
      totalLoans,
      pendingLoans,
    };
  }
}
