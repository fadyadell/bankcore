import { Module } from '@nestjs/common';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { AuditLogService, GoRulesService } from '@bankcore/common';
import { PrismaModule } from '@bankcore/prisma-client';
import { AuthModule } from '@bankcore/auth';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@bankcore/messaging';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule, KafkaModule],
  controllers: [LoanController],
  providers: [LoanService, AuditLogService, GoRulesService],
})
export class LoanModule {}
