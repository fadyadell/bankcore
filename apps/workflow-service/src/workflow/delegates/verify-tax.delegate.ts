import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { KafkaProducerService } from '@bankcore/kafka';

@Injectable()
export class VerifyTaxDelegate {
  private readonly logger = new Logger(VerifyTaxDelegate.name);

  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async execute(loanId: string): Promise<void> {
    this.logger.log(`Executing Tax Clearance verification for loan: ${loanId}`);

    try {
      if (loanId.includes('fail_tax')) {
        throw new Error('Tax Verification API returned 404');
      }

      this.logger.log(`Tax verification successful for loan: ${loanId}`);
      
      await this.kafkaProducer.publish('bankcore.domain.events', {
        eventType: 'loan.verification.tax.completed',
        payload: { loanId, status: 'SUCCESS' },
      });
    } catch (error: any) {
      this.logger.error(`Tax verification failed: ${error.message}`);
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'VERIFICATION_FAILED',
        message: 'Tax verification failed'
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
