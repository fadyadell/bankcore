import { Injectable } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Prisma, AuditLog } from '@prisma/client';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({ data });
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({ where: { userId } });
  }
}
