import { Controller, Post, Patch, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReviewLoanDto } from './dto/review-loan.dto';

import { Roles, PaginationDto, CurrentUser } from '@bankcore/common';
import type { JwtPayload } from '@bankcore/common';
import { JwtAuthGuard, RolesGuard } from '@bankcore/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  @Roles('customer')
  async createLoan(@Body() dto: CreateLoanDto, @CurrentUser() user: JwtPayload) {
    const result = await this.loanService.createLoan(dto, user);
    return result;
  }

  @Get()
  @Roles('customer', 'employee', 'admin')
  async findAll(@Query() pagination: PaginationDto, @CurrentUser() user: JwtPayload) {
    const result = await this.loanService.findAll(user, pagination);
    return result;
  }

  @Get(':id')
  @Roles('customer', 'employee', 'admin')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.loanService.findOne(id, user);
    return result;
  }

  @Patch(':id/review')
  @Roles('employee', 'admin')
  async reviewLoan(
    @Param('id') id: string,
    @Body() dto: ReviewLoanDto,
    @CurrentUser() user: JwtPayload
  ) {
    const result = await this.loanService.reviewLoan(id, dto, user);
    return result;
  }
}
