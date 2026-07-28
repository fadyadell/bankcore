import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { CreateAccountDto, UpdateAccountStatusDto } from './dto/account.dto.js';
import { PaginationDto, buildPaginatedResponse } from '@bankcore/common';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    const { accounts, total } = await this.accountsService.findAll(
      pagination.page,
      pagination.limit,
      userId,
      status,
    );
    return buildPaginatedResponse(accounts, total, pagination.page, pagination.limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.findById(id);
  }

  @Get(':id/balance')
  async getBalance(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.getBalance(id);
  }

  @Post()
  async create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountStatusDto,
  ) {
    return this.accountsService.updateStatus(id, dto);
  }
}
