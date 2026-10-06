import { IsNumber, Min, IsInt, IsIn, IsOptional } from 'class-validator';

export class CreateLoanDto {
  @IsNumber()
  @Min(100)
  amount: number = 0;

  @IsInt()
  @Min(1)
  termMonths: number = 12;
}

export class ReviewLoanDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: string = '';

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;
}
