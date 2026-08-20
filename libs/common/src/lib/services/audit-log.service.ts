import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  async log(data: { entityType: string; entityId: string; action: string; metadata?: any }) {
    this.logger.log(`Audit: ${data.action} on ${data.entityType} (${data.entityId})`);
    // In a real implementation, this would save to an audit log database or send an event
  }
}
