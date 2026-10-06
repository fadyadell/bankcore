import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string = '';

  @IsNotEmpty()
  @MinLength(6)
  password: string = '';

  @IsNotEmpty()
  firstName: string = '';

  @IsNotEmpty()
  lastName: string = '';

  @IsIn(['CUSTOMER', 'EMPLOYEE', 'ADMIN'])
  role: string = 'CUSTOMER';
}

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsIn(['CUSTOMER', 'EMPLOYEE', 'ADMIN'])
  role?: string;
}
