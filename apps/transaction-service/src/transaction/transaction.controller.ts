import { Controller, Post, Patch, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ReviewTransactionDto } from './dto/review-transaction.dto';

import { Roles, PaginationDto, CurrentUser } from '@bankcore/common';
import type { JwtPayload } from '@bankcore/common';
import { JwtAuthGuard, RolesGuard } from '@bankcore/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @Roles('customer')
  async createTransaction(@Body() dto: CreateTransactionDto, @CurrentUser() user: JwtPayload) {
    const result = await this.transactionService.createTransaction(dto, user);
    return result;
  }

  @Get()
  @Roles('customer', 'employee', 'admin')
  async findAll(@Query() pagination: PaginationDto, @CurrentUser() user: JwtPayload) {
    const result = await this.transactionService.findAll(user, pagination);
    return result;
  }

  @Get(':id')
  @Roles('customer', 'employee', 'admin')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.transactionService.findOne(id, user);
    return result;
  }

  @Patch(':id/review')
  @Roles('employee', 'admin')
  async reviewTransaction(
    @Param('id') id: string,
    @Body() dto: ReviewTransactionDto,
    @CurrentUser() user: JwtPayload
  ) {
    const result = await this.transactionService.reviewTransaction(id, dto, user);
    return result;
  }

}
