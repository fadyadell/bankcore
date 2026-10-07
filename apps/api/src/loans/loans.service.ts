import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Prisma, Loan, User } from '@prisma/client';
import { GoRulesService } from '../integrations/gorules/gorules.service';
import { FlowableService } from '../integrations/flowable/flowable.service';
import type {
  LoanDto,
  LoanStatus,
  PaginatedResponse,
  UserRole,
} from '@bankcore/contracts';

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private goRules: GoRulesService,
    private flowable: FlowableService,
  ) {}

  async findAll(
    page = 1,
    pageSize = 20,
    userId?: string,
    status?: string,
  ): Promise<PaginatedResponse<LoanDto>> {
    const where: Prisma.LoanWhereInput = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [loans, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        include: { user: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loan.count({ where }),
    ]);

    return {
      items: loans.map((l) => this.toDto(l)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findByUser(userId: string): Promise<LoanDto[]> {
    const loans = await this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return loans.map((l) => this.toDto(l));
  }

  async findById(id: string): Promise<LoanDto> {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!loan) throw new NotFoundException('Loan not found');
    return this.toDto(loan);
  }

  async create(
    userId: string,
    amount: number,
    termMonths: number,
  ): Promise<LoanDto> {
    const loan = await this.prisma.loan.create({
      data: {
        userId,
        amount,
        termMonths,
        interestRate: 0,
        status: 'PENDING',
      },
    });

    // Create a notification for employees about the new loan request
    const employees = await this.prisma.user.findMany({
      where: { role: { in: ['EMPLOYEE', 'ADMIN'] } },
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    for (const emp of employees) {
      await this.prisma.notification.create({
        data: {
          userId: emp.id,
          type: 'EMAIL',
          title: 'New Loan Application',
          message: `${user?.firstName} ${user?.lastName} has submitted a loan request for $${amount.toLocaleString()} over ${termMonths} months.`,
          status: 'UNREAD',
        },
      });
    }

    let updatedLoan = loan;
    try {
      // 1. Risk Assessment via GoRules
      const risk = await this.goRules.evaluateLoanRisk({
        loanAmount: amount,
        termMonths,
        monthlyIncome: 5000, // mock data for now
        existingLoanCount: 0,
        existingDebt: 0,
        accountBalance: 1000, // mock data for now
      });

      // 2. Start Workflow via Flowable
      const processId = await this.flowable.startLoanProcess(loan.id, {
        loanAmount: amount,
        termMonths,
        riskLevel: risk.riskLevel,
        riskScore: risk.riskScore,
        decision: risk.decision,
      });

      // 3. Update Loan with Risk & Workflow Info
      updatedLoan = await this.prisma.loan.update({
        where: { id: loan.id },
        data: {
          riskScore: risk.riskScore,
          riskLevel: risk.riskLevel,
          riskDecision: risk.decision,
          processId,
          status: 'EMPLOYEE_REVIEW', // Advance status to employee review
        },
      });
    } catch {
      // Gracefully handle error: Loan remains PENDING, no processId/risk set.
    }

    return this.toDto(updatedLoan);
  }

  async review(
    id: string,
    status: string,
    interestRate?: number,
  ): Promise<LoanDto> {
    const loan = await this.prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundException('Loan not found');
    if (
      !['PENDING', 'RISK_ASSESSED', 'EMPLOYEE_REVIEW', 'ADMIN_REVIEW'].includes(
        loan.status,
      )
    ) {
      throw new BadRequestException(
        'Can only review pending or in-review loans',
      );
    }

    const updateData: Prisma.LoanUpdateInput = { status };
    if (status === 'APPROVED') {
      updateData.interestRate = interestRate ?? 5.0;
    }

    const updated = await this.prisma.loan.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

    if (loan.processId) {
      try {
        const tasks = await this.flowable.getTasksByProcessId(loan.processId);
        if (tasks && tasks.length > 0) {
          const taskId = tasks[0].id;
          await this.flowable.completeTask(taskId, { reviewStatus: status });
        }
      } catch (err) {
        // Log the error but don't fail the review if workflow engine fails here
        console.error('Failed to complete Flowable task', err);
      }
    }

    // Notify the customer
    await this.prisma.notification.create({
      data: {
        userId: updated.userId,
        type: 'PUSH',
        title: status === 'APPROVED' ? 'Loan Approved!' : 'Loan Rejected',
        message:
          status === 'APPROVED'
            ? `Your loan of $${updated.amount.toLocaleString()} has been approved at ${updated.interestRate}% interest.`
            : `Your loan request of $${updated.amount.toLocaleString()} has been rejected.`,
        status: 'UNREAD',
      },
    });

    return this.toDto(updated);
  }

  private toDto(loan: Loan & { user?: User }): LoanDto {
    const dto: LoanDto = {
      id: loan.id,
      userId: loan.userId,
      amount: loan.amount,
      interestRate: loan.interestRate,
      termMonths: loan.termMonths,
      status: loan.status as LoanStatus,
      riskScore: loan.riskScore,
      riskLevel: loan.riskLevel,
      riskDecision: loan.riskDecision,
      processId: loan.processId,
      employeeId: loan.employeeId,
      adminId: loan.adminId,
      rejectionReason: loan.rejectionReason,
      createdAt: loan.createdAt.toISOString(),
      updatedAt: loan.updatedAt.toISOString(),
    };
    if (loan.user) {
      dto.user = {
        id: loan.user.id,
        email: loan.user.email,
        firstName: loan.user.firstName,
        lastName: loan.user.lastName,
        role: loan.user.role as UserRole,
        createdAt: loan.user.createdAt.toISOString(),
        updatedAt: loan.user.updatedAt.toISOString(),
      };
    }
    return dto;
  }
}
