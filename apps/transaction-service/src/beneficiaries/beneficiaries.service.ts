import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Beneficiary } from '@prisma/client';

export interface CreateBeneficiaryDto {
  userId: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  swiftCode?: string;
  routingNumber?: string;
  isInternal?: boolean;
}

@Injectable()
export class BeneficiariesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBeneficiaryDto): Promise<Beneficiary> {
    return this.prisma.beneficiary.create({
      data: {
        userId: dto.userId,
        accountName: dto.accountName,
        accountNumber: dto.accountNumber,
        bankName: dto.bankName,
        swiftCode: dto.swiftCode,
        routingNumber: dto.routingNumber,
        isInternal: dto.isInternal ?? true,
        status: 'VERIFIED', // Auto-verify for simplicity
      }
    });
  }

  async findAll(userId: string): Promise<Beneficiary[]> {
    return this.prisma.beneficiary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.beneficiary.delete({
      where: { id }
    });
  }
}
