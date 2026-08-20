import { Controller, Get, Patch, Param, Sse, UseGuards, Res } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles, CurrentUser } from '@bankcore/common';
import type { JwtPayload } from '@bankcore/common';
import { JwtAuthGuard, RolesGuard } from '@bankcore/auth';
import { Observable } from 'rxjs';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles('customer', 'employee', 'admin')
  async getMyNotifications(@CurrentUser() user: JwtPayload) {
    const userDb = await this.notificationService['prisma'].user.findUnique({ where: { keycloakId: user.sub }});
    const result = await this.notificationService.getMyNotifications(userDb!.id);
    return result;
  }

  @Patch(':id/read')
  @Roles('customer', 'employee', 'admin')
  async markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const userDb = await this.notificationService['prisma'].user.findUnique({ where: { keycloakId: user.sub }});
    await this.notificationService.markRead(id, userDb!.id);
    return { success: true };
  }

  @Sse('stream')
  @Roles('customer', 'employee', 'admin')
  async stream(@CurrentUser() user: JwtPayload, @Res() res: Response): Promise<Observable<MessageEvent>> {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const userDb = await this.notificationService['prisma'].user.findUnique({ where: { keycloakId: user.sub }});
    return this.notificationService.getSSEStream(userDb!.id);
  }
}
