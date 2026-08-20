import { Controller, Post, Patch, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ReviewTransactionDto } from './dto/review-transaction.dto';

import { Roles, PaginationDto, ResponseDto } from '@bankcore/common';
import { CurrentUser, KeycloakAuthGuard, RolesGuard, CurrentUserPayload } from '@bankcore/auth';
import { UserRole } from '@bankcore/database';

@UseGuards(KeycloakAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  async createTransaction(@Body() dto: CreateTransactionDto, @CurrentUser() user: CurrentUserPayload) {
    const result = await this.transactionService.createTransaction(dto, user);
    return ResponseDto.success(result);
  }

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async findAll(@Query() pagination: PaginationDto, @CurrentUser() user: CurrentUserPayload) {
    const result = await this.transactionService.findAll(user, pagination);
    return ResponseDto.success(result);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    const result = await this.transactionService.findOne(id, user);
    return ResponseDto.success(result);
  }

  @Patch(':id/review')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  async reviewTransaction(
    @Param('id') id: string,
    @Body() dto: ReviewTransactionDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    const result = await this.transactionService.reviewTransaction(id, dto, user);
    return ResponseDto.success(result);
  }

}
