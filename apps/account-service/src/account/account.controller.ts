import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { PaginationDto, ResponseDto } from '@bankcore/common';
import { Roles, CurrentUser } from '@bankcore/common';
import { JwtAuthGuard, RolesGuard } from '@bankcore/auth';
import { UserRole } from '@bankcore/database';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @Roles(UserRole.CUSTOMER)
  async getMyAccounts(@CurrentUser() user: any) {
    const result = await this.accountService.getMyAccounts(user);
    return ResponseDto.success(result);
  }

  @Post()
  @Roles(UserRole.CUSTOMER)
  async createAccount(@CurrentUser() user: any, @Body() dto: any) {
    const result = await this.accountService.createAccount(user, dto);
    return ResponseDto.success(result);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  async getAllAccounts(@Query() pagination: PaginationDto) {
    const result = await this.accountService.getAllAccounts(pagination);
    return ResponseDto.success(result);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async getAccount(@Param('id') id: string, @Query() pagination: PaginationDto, @CurrentUser() user: any) {
    const result = await this.accountService.getAccount(id, user, pagination);
    return ResponseDto.success(result);
  }
}
