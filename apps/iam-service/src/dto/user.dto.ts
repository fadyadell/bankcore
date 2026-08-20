import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false, enum: ['CUSTOMER', 'EMPLOYEE', 'ADMIN'] })
  @IsString()
  @IsOptional()
  role?: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
