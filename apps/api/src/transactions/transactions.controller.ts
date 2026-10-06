import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto, WithdrawDto, TransferDto } from './dto/transaction.dto';
import { Roles, CurrentUser } from '../auth/decorators';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('accountId') accountId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.transactionsService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      accountId,
      type,
      status,
    );
  }

  @Get('my')
  async getMyTransactions(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.transactionsService.findByUser(
      user.id,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Post('deposit')
  async deposit(@Body() dto: DepositDto) {
    // Customers can only deposit to their own accounts (verified in service for withdraw/transfer)
    return this.transactionsService.deposit(
      dto.accountId,
      dto.amount,
      dto.reference,
    );
  }

  @Post('withdraw')
  async withdraw(
    @Body() dto: WithdrawDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.transactionsService.withdraw(
      dto.accountId,
      dto.amount,
      user.id,
      dto.reference,
    );
  }

  @Post('transfer')
  async transfer(
    @Body() dto: TransferDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.transactionsService.transfer(
      dto.fromAccountId,
      dto.toAccountId,
      dto.amount,
      user.id,
      dto.reference,
    );
  }
}
