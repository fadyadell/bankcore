import { Injectable, Logger } from '@nestjs/common';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { LoanStatus } from '@prisma/client';
import { LoanApplicationRepository } from './loan-application.repository';
import { KafkaProducerService } from '../messaging/kafka.producer.service';
import { GoRulesService } from '../rules-engine/gorules.service';
import { FlowableService } from '../workflow/flowable.service';

@Injectable()
export class LoanApplicationService {
  private readonly logger = new Logger(LoanApplicationService.name);

  constructor(
    private readonly loanRepository: LoanApplicationRepository,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly goRulesService: GoRulesService,
    private readonly flowableService: FlowableService,
  ) {}

  async processNewApplication(data: CreateLoanApplicationDto): Promise<Record<string, unknown>> {
    this.logger.log(`Processing new loan application for customer ${data.customerId} for amount: ${data.amount}`);
    
    // 1. Evaluate with GoRules
    const rulesResult = await this.goRulesService.evaluateLoanApplication(data.amount, data.customerId);
    
    let initialStatus: LoanStatus = LoanStatus.PENDING;
    if (rulesResult.decision === 'APPROVED') {
      initialStatus = LoanStatus.APPROVED;
    } else if (rulesResult.decision === 'REJECTED') {
      initialStatus = LoanStatus.REJECTED;
    }

    // 2. Save to database
    const loan = await this.loanRepository.createWithTransaction(data, initialStatus);
    this.logger.log(`Successfully created loan application with ID: ${loan.id}`);

    // 3. Trigger Flowable if manual review needed
    if (rulesResult.decision === 'MANUAL_REVIEW') {
      await this.flowableService.startUnderwritingProcess(loan.id, loan.customerId);
    }

    const payload = {
      applicationId: loan.id,
      customerId: loan.customerId,
      amount: loan.amount,
      loanType: loan.loanType,
      status: loan.status,
      submittedAt: loan.createdAt,
    };

    // Emit event to Kafka for other services (e.g. notifications)
    await this.kafkaProducer.emitEvent('loan.application.submitted', payload);

    return payload;
  }

  async findAll() {
    return this.loanRepository.findAll();
  }
}
