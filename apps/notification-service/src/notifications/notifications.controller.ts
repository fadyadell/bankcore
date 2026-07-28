import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { PaginationDto, buildPaginatedResponse } from '@bankcore/common';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() pagination: PaginationDto,
  ) {
    const { notifications, total } = await this.notificationsService.findByUser(
      userId,
      pagination.page,
      pagination.limit,
    );
    return buildPaginatedResponse(notifications, total, pagination.page, pagination.limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const notification = await this.notificationsService.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }
}
