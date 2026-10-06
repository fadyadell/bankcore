import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Prisma, Notification } from '@prisma/client';
import type {
  NotificationDto,
  NotificationType,
  NotificationStatus,
  PaginatedResponse,
} from '@bankcore/contracts';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 20,
    userId?: string,
    status?: string,
  ): Promise<PaginatedResponse<NotificationDto>> {
    const where: Prisma.NotificationWhereInput = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items: notifications.map((n) => this.toDto(n)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findByUser(userId: string): Promise<NotificationDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map((n) => this.toDto(n));
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, status: 'UNREAD' },
    });
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
  }): Promise<NotificationDto> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        status: 'UNREAD',
      },
    });
    return this.toDto(notification);
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId)
      throw new NotFoundException('Notification not found');

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { status: 'READ' },
    });
    return this.toDto(updated);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ' },
    });
    return { count: result.count };
  }

  async delete(id: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.prisma.notification.delete({ where: { id } });
  }

  private toDto(n: Notification): NotificationDto {
    return {
      id: n.id,
      userId: n.userId,
      type: n.type as NotificationType,
      title: n.title,
      message: n.message,
      status: n.status as NotificationStatus,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    };
  }
}
