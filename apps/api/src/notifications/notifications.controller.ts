import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { Roles, CurrentUser } from '../auth/decorators';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.notificationsService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      userId,
      status,
    );
  }

  @Get('my')
  async getMyNotifications(@CurrentUser() user: { id: string }) {
    return this.notificationsService.findByUser(user.id);
  }

  @Get('my/unread-count')
  async getUnreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.notificationsService.countUnread(user.id);
    return { count };
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Put('read-all')
  async markAllAsRead(@CurrentUser() user: { id: string }) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id') id: string) {
    await this.notificationsService.delete(id);
    return { success: true };
  }
}
