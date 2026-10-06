import { IsNotEmpty, IsIn, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  userId: string = '';

  @IsIn(['CHECKING', 'SAVINGS'])
  type: string = 'CHECKING';

  @IsOptional()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialDeposit?: number;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'CLOSED'])
  status?: string;
}
