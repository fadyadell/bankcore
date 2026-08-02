import { Controller, Get } from '@nestjs/common';
import { Public } from '@bankcore/common';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  check(): { status: string; service: string; timestamp: string; uptime: number } {
    return {
      status: 'healthy',
      service: 'account-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @Public()
  ready(): { status: string } {
    return { status: 'ready' };
  }

  @Get('live')
  @Public()
  live(): { status: string } {
    return { status: 'alive' };
  }
}
