import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Get, UseGuards } from '@nestjs/common';
import { LoanApplicationService } from './loan-application.service';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('loans/applications')
@UseGuards(JwtAuthGuard)
export class LoanApplicationController {
  private readonly logger = new Logger(LoanApplicationController.name);

  constructor(private readonly loanApplicationService: LoanApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitApplication(@Body() payload: CreateLoanApplicationDto) {
    this.logger.log(`Received loan application request`);
    return this.loanApplicationService.processNewApplication(payload);
  }

  @Get()
  async getApplications() {
    this.logger.log('Fetching loan applications');
    return this.loanApplicationService.findAll();
  }
}
