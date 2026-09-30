import { TOPICS } from '@bankcore/contracts';
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { AuditLogService, PaginationDto, GoRulesService } from '@bankcore/common';
import { KafkaProducerService } from '@bankcore/kafka';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReviewLoanDto } from './dto/review-loan.dto';
import axios from 'axios';

import { JwtPayload } from '@bankcore/common';

@Injectable()
export class LoanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly goRulesService: GoRulesService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  private async resolveUserId(currentUser: JwtPayload) {
    let userDb = await this.prisma.user.findUnique({ where: { keycloakId: currentUser.sub } });
    if (!userDb && currentUser.email) {
      userDb = await this.prisma.user.findUnique({ where: { email: currentUser.email } });
      if (userDb) {
        userDb = await this.prisma.user.update({
          where: { id: userDb.id },
          data: { keycloakId: currentUser.sub }
        });
      }
    }
    return userDb;
  }

  async createLoan(dto: CreateLoanDto, currentUser: JwtPayload) {
    const userDb = await this.resolveUserId(currentUser);
    if (!userDb) {
      throw new ForbiddenException('User is not registered');
    }

    const existingLoansCount = await this.prisma.loan.count({
      where: {
        userId: userDb.id,
        status: { notIn: ['REJECTED'] as any }
      }
    });

    const { riskTier } = await this.goRulesService.evaluateLoanRisk({
      amount: dto.amount,
      termMonths: dto.termMonths,
      existingLoans: existingLoansCount,
    });

    const loan = await this.prisma.loan.create({
      data: {
        referenceNumber: `LN-${Date.now()}`,
        userId: userDb.id,
        amount: dto.amount,
        interestRate: 0.05,
        purpose: dto.purpose,
        termMonths: dto.termMonths,
        status: 'PENDING' as any,
        riskLevel: riskTier,
      },
    });

    await this.auditLogService.log({
      entityType: 'LOAN',
      entityId: loan.id,
      action: 'LOAN_APPLIED',
      metadata: { actorId: userDb.id, after: { loan, riskTier } },
    });

    try {
      await this.kafkaProducer.publish(TOPICS.LOAN_APPLIED, {
        loanId: loan.id,
        userId: userDb.id,
        amount: loan.amount,
        currency: 'EGP',
      });
    } catch (e) {
      console.error('Failed to publish loan applied event', e);
    }

    return loan;
  }

  async findAll(currentUser: JwtPayload, pagination: PaginationDto) {
    const userDb = await this.resolveUserId(currentUser);
    if (!userDb) throw new ForbiddenException('User not found');

    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 20);
    const take = pagination.limit || 20;

    const roles = (currentUser.realm_access?.roles || []).map(r => r.toUpperCase());
    const isEmployeeOrAdmin = roles.includes('EMPLOYEE') || roles.includes('ADMIN');

    let whereClause = {};

    if (!isEmployeeOrAdmin) {
      whereClause = { userId: userDb.id };
    } else {
      whereClause = {
        status: { notIn: ['APPROVED', 'REJECTED'] as any }
      };
    }

    return this.prisma.loan.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: true,
      }
    });
  }

  async findOne(id: string, currentUser: JwtPayload) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        user: true,
        approvals: true
      }
    });

    if (!loan) throw new NotFoundException('Loan not found');

    const roles = (currentUser.realm_access?.roles || []).map(r => r.toUpperCase());
    const isEmployeeOrAdmin = roles.includes('EMPLOYEE') || roles.includes('ADMIN');

    if (!isEmployeeOrAdmin) {
      const userDb = await this.resolveUserId(currentUser);
      if (!userDb || loan.userId !== userDb.id) {
        throw new ForbiddenException('You do not have access to this loan');
      }
    }

    return loan;
  }

  async reviewLoan(id: string, dto: ReviewLoanDto, currentUser: JwtPayload) {
    const userDb = await this.resolveUserId(currentUser);
    if (!userDb) throw new ForbiddenException('User not found in DB');

    const roles = (currentUser.realm_access?.roles || []).map(r => r.toUpperCase());
    const isEmployee = roles.includes('EMPLOYEE');
    const isAdmin = roles.includes('ADMIN');

    if (!isEmployee && !isAdmin) {
      throw new ForbiddenException('Only employees or admins can review loans');
    }

    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!loan) throw new NotFoundException('Loan not found');

    if (loan.status === 'APPROVED' || loan.status === 'REJECTED') {
      throw new BadRequestException('Loan is already processed');
    }

    let currentStage = 'EMPLOYEE_REVIEW';
    if (loan.status === 'REVIEWING') {
      currentStage = 'ADMIN_FINAL';
    } else if (loan.status !== 'PENDING') {
      throw new BadRequestException(`Cannot review loan in status: ${loan.status}`);
    }

    if (currentStage === 'ADMIN_FINAL' && !isAdmin) {
      throw new ForbiddenException('Only admins can review this loan');
    }

    return await this.prisma.$transaction(async (tx: any) => {
      await tx.approval.create({
        data: {
          entityType: 'LOAN',
          entityId: loan.id,
          reviewerId: userDb.id,
          role: currentStage,
          status: dto.decision as any,
          comments: dto.reason,
        }
      });

      let nextStatus = loan.status;

      if (dto.decision === 'REJECTED') {
        nextStatus = 'REJECTED' as any;
      } else {
        if (currentStage === 'EMPLOYEE_REVIEW') {
          if (Number(loan.amount) > 50000) {
            nextStatus = 'REVIEWING' as any;
          } else {
            nextStatus = 'APPROVED' as any;
          }
        } else if (currentStage === 'ADMIN_FINAL') {
          nextStatus = 'APPROVED' as any;
        }
      }

      const updatedLoan = await tx.loan.update({
        where: { id: loan.id },
        data: { status: nextStatus },
      });

      await this.auditLogService.log({
        entityType: 'LOAN',
        entityId: loan.id,
        action: `REVIEWED_${dto.decision}`,
        metadata: { actorId: userDb.id, after: updatedLoan },
      });



      return updatedLoan;
    });
  }
}
