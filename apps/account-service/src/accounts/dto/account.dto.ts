import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export enum AccountTypeDto {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  FIXED_DEPOSIT = 'FIXED_DEPOSIT',
  LOAN = 'LOAN',
}

export enum AccountStatusDto {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  DORMANT = 'DORMANT',
  CLOSED = 'CLOSED',
}

export class CreateAccountDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsEnum(AccountTypeDto)
  type!: AccountTypeDto;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overdraftLimit?: number;
}

export class UpdateAccountStatusDto {
  @IsEnum(AccountStatusDto)
  status!: AccountStatusDto;

  @IsOptional()
  @IsString()
  reason?: string;
}
