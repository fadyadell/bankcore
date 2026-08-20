import { IsUUID, IsPositive, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  fromAccountId!: string;

  @IsUUID()
  toAccountId!: string;

  @IsPositive()
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  currency?: string = 'EGP';

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
