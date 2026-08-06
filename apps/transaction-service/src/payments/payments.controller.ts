import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PaymentsService, CreatePaymentDto } from './payments.service.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  async findAll(@Query('userId') userId: string) {
    return this.paymentsService.findAll(userId);
  }
}
