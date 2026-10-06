import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto, ReviewLoanDto } from './dto/loan.dto';
import { Roles, CurrentUser } from '../auth/decorators';
import type { LoanDto, PaginatedResponse } from '@bankcore/contracts';

@Controller('loans')
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ): Promise<PaginatedResponse<LoanDto>> {
    return this.loansService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      userId,
      status,
    );
  }

  @Get('my')
  async getMyLoans(@CurrentUser() user: { id: string }): Promise<LoanDto[]> {
    return this.loansService.findByUser(user.id);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<LoanDto> {
    const loan: LoanDto = await this.loansService.findById(id);
    // Customers can only view their own loans
    if (user.role === 'CUSTOMER' && loan.userId !== user.id) {
      throw new ForbiddenException('Forbidden');
    }
    return loan;
  }

  @Post()
  async create(
    @Body() dto: CreateLoanDto,
    @CurrentUser() user: { id: string },
  ): Promise<LoanDto> {
    return this.loansService.create(user.id, dto.amount, dto.termMonths);
  }

  @Put(':id/review')
  @Roles('ADMIN', 'EMPLOYEE')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewLoanDto,
  ): Promise<LoanDto> {
    return this.loansService.review(id, dto.status, dto.interestRate);
  }
}
