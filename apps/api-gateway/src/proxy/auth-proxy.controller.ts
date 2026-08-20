import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public, CORRELATION_ID_HEADER } from '@bankcore/common';
import { ProxyService } from './proxy.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login via Keycloak' })
  async login(
    @Body() body: { username: string; password: string },
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('iam', {
      method: 'POST',
      path: '/auth/login',
      body,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
      },
    });
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Body() body: { refreshToken: string },
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('iam', {
      method: 'POST',
      path: '/auth/refresh',
      body,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
      },
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate token' })
  async logout(
    @Body() body: { refreshToken: string },
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('iam', {
      method: 'POST',
      path: '/auth/logout',
      body,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }
}
