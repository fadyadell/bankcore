import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AuditLogService } from '@bankcore/common';
import { DatabaseModule } from '@bankcore/database';
// Assuming the guards are available in @bankcore/auth as that's best practice, or they can be imported from there.
import { AuthModule } from '@bankcore/auth';
import { KafkaModule } from '@bankcore/kafka';
import { LedgerService } from '../ledger/ledger.service';

import { AdminController } from '../admin/admin.controller';

@Module({
  imports: [DatabaseModule, AuthModule, KafkaModule],
  controllers: [TransactionController, AdminController],
  providers: [TransactionService, AuditLogService, LedgerService],
})
export class TransactionModule {}
