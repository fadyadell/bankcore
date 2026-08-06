import { Controller, Get, Query, Param } from '@nestjs/common';
import { StatementsService } from './statements.service.js';

@Controller('statements')
export class StatementsController {
  constructor(private readonly statementsService: StatementsService) {}

  @Get('generate')
  async generateStatement(
    @Query('accountId') accountId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statementsService.generateStatement(
      accountId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('download/:id')
  async downloadStatement(@Param('id') id: string) {
    // Mock download endpoint
    return {
      message: `Statement ${id} PDF content would be downloaded here.`,
      url: `https://mock-storage.bankcore.local/statements/${id}.pdf`
    };
  }
}
