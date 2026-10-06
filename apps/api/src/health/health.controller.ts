import { Controller, Get } from '@nestjs/common';
import type { HealthStatus } from '@bankcore/contracts';
import { PrismaService } from '@bankcore/database';
import { Public } from '../auth/decorators';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  check(): HealthStatus {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('db')
  async checkDb() {
    const userCount = await this.prisma.user.count();
    return {
      status: 'ok',
      database: 'connected',
      userCount,
    };
  }
}
