import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';

interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          oldValue: entry.oldValue ? (entry.oldValue as any) : undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newValue: entry.newValue ? (entry.newValue as any) : undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  async getByResource(resource: string, resourceId: string, page = 1, limit = 20) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { resource, resourceId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where: { resource, resourceId } }),
    ]);

    return { logs, total };
  }
}
