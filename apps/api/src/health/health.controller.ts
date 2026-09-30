import { Controller, Get } from '@nestjs/common';
import type { HealthStatus } from '@bankcore/contracts';

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthStatus {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
