import { Injectable } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { LoanStatus } from '@prisma/client';

@Injectable()
export class LoanApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithTransaction(data: CreateLoanApplicationDto, status: LoanStatus) {
    // We use Prisma transactions ($transaction) to ensure data integrity.
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loanApplication.create({
        data: {
          customerId: data.customerId,
          amount: data.amount,
          loanType: data.loanType as any,
          status: status,
        },
      });

      return loan;
    });
  }

  async findById(id: string) {
    return this.prisma.loanApplication.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.loanApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Reasonable limit for the portal UI
    });
  }
}
