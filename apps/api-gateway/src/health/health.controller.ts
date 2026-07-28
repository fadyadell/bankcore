import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@bankcore/common';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check' })
  check(): { status: string; service: string; timestamp: string; uptime: number } {
    return {
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe' })
  ready(): { status: string } {
    return { status: 'ready' };
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe' })
  live(): { status: string } {
    return { status: 'alive' };
  }
}
