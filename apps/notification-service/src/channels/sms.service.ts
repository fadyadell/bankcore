import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async send(to: string, body: string): Promise<boolean> {
    // Production: integrate with Twilio, Vonage, AWS SNS, etc.
    this.logger.log(`[SMS] To: ${to}`);
    this.logger.debug(`[SMS] Body: ${body}`);

    // Simulate SMS sending
    return true;
  }
}
