import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { PaginationDto } from '@bankcore/common';
import { Roles, CurrentUser } from '@bankcore/common';
import type { JwtPayload } from '@bankcore/common';
import { JwtAuthGuard, RolesGuard } from '@bankcore/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @Roles('customer')
  async getMyAccounts(@CurrentUser() user: JwtPayload) {
    const result = await this.accountService.getMyAccounts(user);
    return result;
  }

  @Post()
  @Roles('customer')
  async createAccount(@CurrentUser() user: JwtPayload, @Body() dto: { type?: string; currency?: string }) {
    const result = await this.accountService.createAccount(user, dto);
    return result;
  }

  @Get('all')
  @Roles('admin')
  async getAllAccounts(@Query() pagination: PaginationDto) {
    const result = await this.accountService.getAllAccounts(pagination);
    return result;
  }

  @Get(':id')
  @Roles('customer', 'employee', 'admin')
  async getAccount(@Param('id') id: string, @Query() pagination: PaginationDto, @CurrentUser() user: JwtPayload) {
    const result = await this.accountService.getAccount(id, user, pagination);
    return result;
  }
}
