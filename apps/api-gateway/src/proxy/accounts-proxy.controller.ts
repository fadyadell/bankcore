import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { CORRELATION_ID_HEADER, Roles } from '@bankcore/common';
import { ProxyService } from './proxy.service.js';

@ApiTags('Accounts')
@ApiBearerAuth('keycloak-jwt')
@Controller('accounts')
export class AccountsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  @ApiOperation({ summary: 'List accounts' })
  async findAll(
    @Query() query: Record<string, string>,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('account', {
      method: 'GET',
      path: '/accounts',
      query,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('account', {
      method: 'GET',
      path: `/accounts/${id}`,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  async getBalance(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('account', {
      method: 'GET',
      path: `/accounts/${id}/balance`,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  async create(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('account', {
      method: 'POST',
      path: '/accounts',
      body,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }

  @Put(':id/status')
  @Roles('admin', 'bank_officer')
  @ApiOperation({ summary: 'Update account status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('account', {
      method: 'PUT',
      path: `/accounts/${id}/status`,
      body,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }
}
