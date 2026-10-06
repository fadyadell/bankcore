import { IsNotEmpty, IsIn } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  userId: string = '';

  @IsIn(['EMAIL', 'SMS', 'PUSH'])
  type: string = 'EMAIL';

  @IsNotEmpty()
  title: string = '';

  @IsNotEmpty()
  message: string = '';
}
