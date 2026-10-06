import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { GoRulesModule } from '../integrations/gorules/gorules.module';
import { FlowableModule } from '../integrations/flowable/flowable.module';

@Module({
  imports: [GoRulesModule, FlowableModule],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
