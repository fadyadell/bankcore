import { Controller, Get, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('loans')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Patch(':id/final')
  async markFinal(@Param('id', ParseUUIDPipe) id: string) {
    return this.appService.markFinal(id);
  }
}
