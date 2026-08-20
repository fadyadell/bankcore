import { IsIn, IsOptional, IsString } from 'class-validator';

export class CompleteTaskDto {
  @IsIn(['APPROVED', 'REJECTED', 'REQUEST_MORE_INFO'])
  decision!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
