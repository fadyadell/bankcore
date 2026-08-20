import { Controller, Get, Patch, Param, Sse, UseGuards, Res } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles } from '@bankcore/common';
import { CurrentUser, JwtAuthGuard, RolesGuard } from '@bankcore/auth';
import { UserRole } from '@bankcore/database';
import { ResponseDto } from '@bankcore/common';
import { Observable } from 'rxjs';
import { Response } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async getMyNotifications(@CurrentUser() user: any) {
    const userDb = await this.notificationService['prisma'].user.findUnique({ where: { keycloakId: user.sub }});
    const result = await this.notificationService.getMyNotifications(userDb!.id);
    return ResponseDto.success(result);
  }

  @Patch(':id/read')
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async markRead(@Param('id') id: string, @CurrentUser() user: any) {
    const userDb = await this.notificationService['prisma'].user.findUnique({ where: { keycloakId: user.sub }});
    await this.notificationService.markRead(id, userDb!.id);
    return ResponseDto.success({ success: true });
  }

  @Sse('stream')
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async stream(@CurrentUser() user: any, @Res() res: Response): Promise<Observable<MessageEvent>> {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const userDb = await this.notificationService['prisma'].user.findUnique({ where: { keycloakId: user.sub }});
    return this.notificationService.getSSEStream(userDb!.id);
  }
}
