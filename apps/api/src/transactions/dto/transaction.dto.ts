import { IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class DepositDto {
  @IsNotEmpty()
  accountId: string = '';

  @IsNumber()
  @Min(0.01)
  amount: number = 0;

  @IsOptional()
  reference?: string;
}

export class WithdrawDto {
  @IsNotEmpty()
  accountId: string = '';

  @IsNumber()
  @Min(0.01)
  amount: number = 0;

  @IsOptional()
  reference?: string;
}

export class TransferDto {
  @IsNotEmpty()
  fromAccountId: string = '';

  @IsNotEmpty()
  toAccountId: string = '';

  @IsNumber()
  @Min(0.01)
  amount: number = 0;

  @IsOptional()
  reference?: string;
}
