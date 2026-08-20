import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { AuditLogService, PaginationDto, GoRulesService } from '@bankcore/common';
import { RabbitMQClient, KafkaProducerService } from '@bankcore/messaging';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReviewLoanDto } from './dto/review-loan.dto';
import axios from 'axios';

import { CurrentUserPayload } from '@bankcore/auth';
import { LoanStatus, UserRole, ApprovalDecision, ApprovalStage } from '@bankcore/database';
import { RiskTier } from '@bankcore/database'; // Assuming RiskTier is exported

@Injectable()
export class LoanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly goRulesService: GoRulesService,
    private readonly rabbitMQClient: RabbitMQClient,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  private async resolveCustomerUserId(keycloakSub: string) {
    return this.prisma.user.findUnique({ where: { keycloakId: keycloakSub }, include: { customer: true } });
  }

  async createLoan(dto: CreateLoanDto, currentUser: CurrentUserPayload) {
    const userDb = await this.resolveCustomerUserId(currentUser.sub);
    if (!userDb || !userDb.customer) {
      throw new ForbiddenException('User is not a registered customer');
    }

    const existingLoansCount = await this.prisma.loan.count({
      where: {
        customerId: userDb.customer.id,
        status: { notIn: [LoanStatus.REJECTED] }
      }
    });

    const { riskTier } = await this.goRulesService.evaluateLoanRisk({
      amount: dto.amount,
      termMonths: dto.termMonths,
      existingLoans: existingLoansCount,
    });

    const loan = await this.prisma.loan.create({
      data: {
        customerId: userDb.customer.id,
        amount: dto.amount,
        purpose: dto.purpose,
        termMonths: dto.termMonths,
        status: LoanStatus.PENDING,
        riskTier: riskTier as RiskTier, // ensure enum match
      },
    });

    await this.auditLogService.log({
      entityType: 'LOAN',
      entityId: loan.id,
      action: 'LOAN_APPLIED',
      actorId: userDb.id,
      after: { loan, riskTier },
    });

    await this.rabbitMQClient.publish('bankcore.notifications.employee', {
      type: 'LOAN_APPLIED',
      title: 'New Loan Application Requires Review',
      body: `Loan application for ${loan.amount} over ${loan.termMonths} months requires employee review.`,
      metadata: { loanId: loan.id },
    });

    try {
      const workflowServiceUrl = process.env.WORKFLOW_SERVICE_URL || 'http://localhost:3007';
      await axios.post(`${workflowServiceUrl}/workflows/loan/${loan.id}/start`);
    } catch (e) {
      console.error('Failed to start loan workflow', e);
    }

    return loan;
  }

  async findAll(currentUser: CurrentUserPayload, pagination: PaginationDto) {
    const userDb = await this.resolveCustomerUserId(currentUser.sub);
    if (!userDb) throw new ForbiddenException('User not found');

    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 20);
    const take = pagination.limit || 20;

    const roles = currentUser.realm_access?.roles || [];
    const isEmployeeOrAdmin = roles.includes(UserRole.EMPLOYEE) || roles.includes(UserRole.ADMIN);

    let whereClause = {};

    if (!isEmployeeOrAdmin) {
      if (!userDb.customer) throw new ForbiddenException('Customer profile not found');
      whereClause = { customerId: userDb.customer.id };
    } else {
      whereClause = {
        status: { notIn: [LoanStatus.APPROVED, LoanStatus.REJECTED] }
      };
    }

    return this.prisma.loan.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        customer: { include: { user: true } },
      }
    });
  }

  async findOne(id: string, currentUser: CurrentUserPayload) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        approvals: { include: { approver: true } }
      }
    });

    if (!loan) throw new NotFoundException('Loan not found');

    const roles = currentUser.realm_access?.roles || [];
    const isEmployeeOrAdmin = roles.includes(UserRole.EMPLOYEE) || roles.includes(UserRole.ADMIN);

    if (!isEmployeeOrAdmin) {
      const userDb = await this.resolveCustomerUserId(currentUser.sub);
      if (!userDb?.customer || loan.customerId !== userDb.customer.id) {
        throw new ForbiddenException('You do not have access to this loan');
      }
    }

    return loan;
  }

  async reviewLoan(id: string, dto: ReviewLoanDto, currentUser: CurrentUserPayload) {
    const userDb = await this.prisma.user.findUnique({ where: { keycloakId: currentUser.sub } });
    if (!userDb) throw new ForbiddenException('User not found in DB');

    const roles = currentUser.realm_access?.roles || [];
    const isEmployee = roles.includes(UserRole.EMPLOYEE);
    const isAdmin = roles.includes(UserRole.ADMIN);

    if (!isEmployee && !isAdmin) {
      throw new ForbiddenException('Only employees or admins can review loans');
    }

    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (!loan) throw new NotFoundException('Loan not found');

    if (loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.REJECTED) {
      throw new BadRequestException('Loan is already processed');
    }

    let currentStage: ApprovalStage = ApprovalStage.EMPLOYEE_REVIEW;
    if (loan.status === LoanStatus.ADMIN_REVIEW) {
      currentStage = ApprovalStage.ADMIN_FINAL;
    } else if (loan.status !== LoanStatus.PENDING && loan.status !== LoanStatus.EMPLOYEE_REVIEW) {
      throw new BadRequestException(`Cannot review loan in status: ${loan.status}`);
    }

    if (currentStage === ApprovalStage.ADMIN_FINAL && !isAdmin) {
      throw new ForbiddenException('Only admins can review this loan');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.approval.create({
        data: {
          loanId: loan.id,
          stage: currentStage,
          decision: dto.decision,
          reason: dto.reason,
          approverId: userDb.id,
        }
      });

      let nextStatus = loan.status;

      if (dto.decision === ApprovalDecision.REJECTED) {
        nextStatus = LoanStatus.REJECTED;
      } else {
        if (currentStage === ApprovalStage.EMPLOYEE_REVIEW) {
          if (Number(loan.amount) > 50000) {
            nextStatus = LoanStatus.ADMIN_REVIEW;
          } else {
            nextStatus = LoanStatus.APPROVED;
          }
        } else if (currentStage === ApprovalStage.ADMIN_FINAL) {
          nextStatus = LoanStatus.APPROVED;
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
        actorId: userDb.id,
        after: updatedLoan as unknown as Record<string, unknown>,
      });

      await this.rabbitMQClient.publish(`bankcore.notifications.customer.${loan.customer.userId}`, {
        type: 'LOAN_STATUS_UPDATED',
        title: 'Loan Status Updated',
        body: `Your loan status is now ${nextStatus}.`,
        metadata: { loanId: loan.id, status: nextStatus },
      });

      await this.kafkaProducer.publish('bankcore.domain.events', {
        eventType: 'loan.updated',
        payload: {
          loanId: loan.id,
          status: nextStatus,
          userId: loan.customerId,
          customerId: loan.customerId,
        },
      });

      return updatedLoan;
    });
  }
}
