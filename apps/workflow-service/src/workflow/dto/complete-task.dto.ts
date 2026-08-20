import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalDecision } from '@bankcore/database';

export class CompleteTaskDto {
  @IsEnum(ApprovalDecision)
  decision!: ApprovalDecision;

  @IsOptional()
  @IsString()
  reason?: string;
}
