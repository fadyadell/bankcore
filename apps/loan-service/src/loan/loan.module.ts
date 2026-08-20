import { Module } from '@nestjs/common';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { AuditLogService, GoRulesService } from '@bankcore/common';
import { PrismaModule } from '@bankcore/database';
import { AuthModule } from '@bankcore/auth';
import { ConfigModule } from '@nestjs/config';
import { MessagingModule } from '@bankcore/messaging';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule, MessagingModule],
  controllers: [LoanController],
  providers: [LoanService, AuditLogService, GoRulesService],
})
export class LoanModule {}
