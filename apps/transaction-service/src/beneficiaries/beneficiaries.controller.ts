import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { BeneficiariesService, CreateBeneficiaryDto } from './beneficiaries.service.js';

@Controller('beneficiaries')
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Post()
  async create(@Body() dto: CreateBeneficiaryDto) {
    return this.beneficiariesService.create(dto);
  }

  @Get()
  async findAll(@Query('userId') userId: string) {
    return this.beneficiariesService.findAll(userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.beneficiariesService.remove(id);
    return { success: true };
  }
}
