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

@ApiTags('Users')
@ApiBearerAuth('keycloak-jwt')
@Controller('users')
export class UsersProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  @Roles('admin', 'bank_officer')
  @ApiOperation({ summary: 'List all users' })
  async findAll(
    @Query() query: Record<string, string>,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('iam', {
      method: 'GET',
      path: '/users',
      query,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('iam', {
      method: 'GET',
      path: `/users/${id}`,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user' })
  async create(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('iam', {
      method: 'POST',
      path: '/users',
      body,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.proxy.forward('iam', {
      method: 'PUT',
      path: `/users/${id}`,
      body,
      headers: {
        [CORRELATION_ID_HEADER]: req.headers[CORRELATION_ID_HEADER] as string,
        authorization: req.headers['authorization'] as string,
      },
    });
  }
}
