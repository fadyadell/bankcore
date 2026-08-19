import { Controller, Get, Post, Patch, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import { DepositDto, WithdrawalDto, TransferDto } from './dto/transaction.dto.js';
import { PaginationDto, buildPaginatedResponse } from '@bankcore/common';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('accountId') accountId?: string,
    @Query('status') status?: string,
  ) {
    const { transactions, total } = await this.transactionsService.findAll(
      pagination.page,
      pagination.limit,
      accountId,
      status,
    );
    return buildPaginatedResponse(transactions, total, pagination.page, pagination.limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findById(id);
  }

  @Post('deposit')
  async deposit(@Body() dto: DepositDto) {
    return this.transactionsService.deposit(dto);
  }

  @Post('withdrawal')
  async withdrawal(@Body() dto: WithdrawalDto) {
    return this.transactionsService.withdrawal(dto);
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferDto) {
    return this.transactionsService.transfer(dto);
  }

  @Patch(':id/final')
  async markFinal(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.markFinal(id);
  }
}
