import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { CORRELATION_ID_HEADER } from '@bankcore/common';
import { ProxyService } from './proxy.service.js';

@ApiTags('Transactions')
@ApiBearerAuth('keycloak-jwt')
@Controller('transactions')
export class TransactionsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions' })
  async findAll(
    @Query() query: Record<string, string>,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('transaction', {
      method: 'GET',
      path: '/transactions',
      query,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('transaction', {
      method: 'GET',
      path: `/transactions/${id}`,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  async createTransaction(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('transaction', {
      method: 'POST',
      path: '/transactions',
      body,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        'idempotency-key': req.headers['idempotency-key'] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }
}
