import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles, CurrentUser } from '../auth/decorators';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin')
  @Roles('ADMIN')
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('customer')
  async getCustomerDashboard(@CurrentUser() user: { id: string }) {
    return this.dashboardService.getCustomerDashboard(user.id);
  }
}
