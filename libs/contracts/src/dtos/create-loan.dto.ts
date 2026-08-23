import { IsNumber, IsPositive, IsString, IsOptional, Min } from 'class-validator';

export class CreateLoanDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  currency!: string;

  @IsNumber()
  @Min(1)
  termMonths!: number;

  @IsString()
  @IsOptional()
  purpose?: string;
}
