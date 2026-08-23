import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { KafkaProducerService } from '@bankcore/kafka';

@Injectable()
export class VerifyNationalIdDelegate {
  private readonly logger = new Logger(VerifyNationalIdDelegate.name);

  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async execute(loanId: string): Promise<void> {
    this.logger.log(`Executing National ID verification for loan: ${loanId}`);

    // Mock API call to an external service or internal microservice
    try {
      // Intentionally passing random logic to simulate a deliberate failure mechanism for POC
      // E.g., if loanId ends in "fail_id", we throw an error to test the boundary event
      if (loanId.includes('fail_id')) {
        throw new Error('National ID Verification API returned 404');
      }

      this.logger.log(`National ID verification successful for loan: ${loanId}`);
      
      await this.kafkaProducer.publish('bankcore.domain.events', {
        eventType: 'loan.verification.national_id.completed',
        payload: { loanId, status: 'SUCCESS' },
      });
    } catch (error: any) {
      this.logger.error(`National ID verification failed: ${error.message}`);
      // Throw an HTTP 400 with a specific error so Flowable triggers VERIFICATION_FAILED boundary event
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'VERIFICATION_FAILED',
        message: 'National ID verification failed'
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
