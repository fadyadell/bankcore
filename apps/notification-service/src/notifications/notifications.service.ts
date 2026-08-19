import { Injectable } from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';
import type { Notification, NotificationChannel, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  // private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    channel: string;
    type: string;
    subject?: string;
    body: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        channel: data.channel as NotificationChannel,
        type: data.type,
        subject: data.subject,
        body: data.body,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (data.metadata as any) ?? undefined,
        status: 'PENDING',
      },
    });
  }

  async markSent(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: {
        status: 'SENT' as NotificationStatus,
        sentAt: new Date(),
      },
    });
  }

  async markFailed(id: string, reason: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: {
        status: 'FAILED' as NotificationStatus,
        failedAt: new Date(),
        failureReason: reason,
      },
    });
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { notifications, total };
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }
}
