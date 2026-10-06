import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { Roles, CurrentUser } from '../auth/decorators';

@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.accountsService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      userId,
      type,
      status,
    );
  }

  @Get('my')
  async getMyAccounts(@CurrentUser() user: { id: string; role: string }) {
    return this.accountsService.findByUser(user.id);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const account = await this.accountsService.findById(id);
    // Customers can only view their own accounts
    if (user.role === 'CUSTOMER' && account.userId !== user.id) {
      throw new Error('Forbidden');
    }
    return account;
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Put(':id/status')
  @Roles('ADMIN')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.updateStatus(id, dto.status!);
  }
}
