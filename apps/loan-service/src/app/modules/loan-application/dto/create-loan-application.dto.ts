import { IsNumber, Min, Max, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { LoanType } from '../constants/loan-status.enum';

export class CreateLoanApplicationDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsNumber()
  @Min(1000, { message: 'Minimum loan amount is 1000' })
  @Max(5000000, { message: 'Maximum loan amount exceeded' })
  amount: number;

  @IsEnum(LoanType)
  loanType: LoanType;
}
