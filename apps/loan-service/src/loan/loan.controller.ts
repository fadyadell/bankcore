import { Controller, Post, Patch, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReviewLoanDto } from './dto/review-loan.dto';

import { Roles, PaginationDto, ResponseDto } from '@bankcore/common';
import { CurrentUser, KeycloakAuthGuard, RolesGuard, CurrentUserPayload } from '@bankcore/auth';
import { UserRole } from '@bankcore/database';

@UseGuards(KeycloakAuthGuard, RolesGuard)
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  async createLoan(@Body() dto: CreateLoanDto, @CurrentUser() user: CurrentUserPayload) {
    const result = await this.loanService.createLoan(dto, user);
    return ResponseDto.success(result);
  }

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async findAll(@Query() pagination: PaginationDto, @CurrentUser() user: CurrentUserPayload) {
    const result = await this.loanService.findAll(user, pagination);
    return ResponseDto.success(result);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    const result = await this.loanService.findOne(id, user);
    return ResponseDto.success(result);
  }

  @Patch(':id/review')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  async reviewLoan(
    @Param('id') id: string,
    @Body() dto: ReviewLoanDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    const result = await this.loanService.reviewLoan(id, dto, user);
    return ResponseDto.success(result);
  }
}
