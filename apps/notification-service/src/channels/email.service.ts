import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(to: string, subject: string, body: string): Promise<boolean> {
    // Production: integrate with SendGrid, SES, Mailgun, etc.
    this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    this.logger.debug(`[EMAIL] Body: ${body}`);

    // Simulate email sending
    return true;
  }
}
