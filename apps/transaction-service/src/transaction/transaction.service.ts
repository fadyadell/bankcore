import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { AuditLogService, PaginationDto, generateReferenceNumber } from '@bankcore/common';
import { RabbitMQClient, KafkaProducerService } from '@bankcore/messaging';
import axios from 'axios';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import { CurrentUserPayload } from '@bankcore/auth';
import { TransactionStatus, UserRole, ApprovalDecision, ApprovalStage, Account } from '@bankcore/database';
import { LedgerService } from '../ledger/ledger.service';
import { ReviewTransactionDto } from './dto/review-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly rabbitMQClient: RabbitMQClient,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly ledgerService: LedgerService,
  ) {}

  private async resolveCustomerUserId(keycloakSub: string) {
    const user = await this.prisma.user.findUnique({ where: { keycloakId: keycloakSub }, include: { customer: true, employee: true } });
    return user;
  }

  async createTransaction(dto: CreateTransactionDto, currentUser: CurrentUserPayload) {
    const userDb = await this.resolveCustomerUserId(currentUser.sub);
    if (!userDb || !userDb.customer) {
      throw new ForbiddenException('User is not a registered customer');
    }

    if (dto.idempotencyKey) {
      const existingTx = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existingTx) return existingTx;
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      // Pessimistic lock on the account to prevent double spending
      const accounts = await tx.$queryRaw<Account[]>`SELECT * FROM "Account" WHERE id = ${dto.fromAccountId} FOR UPDATE`;
      
      if (!accounts || accounts.length === 0) {
        throw new NotFoundException('From account not found');
      }
      const fromAccount = accounts[0];

      if (fromAccount.customerId !== userDb.customer?.id) {
        throw new ForbiddenException('Account does not belong to you');
      }

      if (Number(fromAccount.balance) < dto.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      const toAccount = await tx.account.findUnique({
        where: { id: dto.toAccountId },
      });

      if (!toAccount) {
        throw new NotFoundException('To account not found');
      }

      const newTx = await tx.transaction.create({
        data: {
          referenceNumber: generateReferenceNumber(),
          idempotencyKey: dto.idempotencyKey,
          debitAccountId: dto.fromAccountId,
          creditAccountId: dto.toAccountId,
          amount: dto.amount,
          type: 'TRANSFER',
          currency: dto.currency || 'EGP',
          description: dto.description,
          status: TransactionStatus.PENDING,
        },
      });

      return newTx;
    });

    await this.auditLogService.log({
      entityType: 'TRANSACTION',
      entityId: transaction.id,
      action: 'CREATED',
      actorId: userDb.id,
      after: transaction as unknown as Record<string, unknown>,
    });

    try {
      const workflowServiceUrl = process.env.WORKFLOW_SERVICE_URL || 'http://localhost:3007';
      await axios.post(`${workflowServiceUrl}/workflows/transaction/${transaction.id}/start`);
    } catch (e) {
      console.error(e);
    }

    await this.rabbitMQClient.publish('bankcore.notifications.employee', {
      type: 'TRANSACTION_CREATED',
      title: 'New Transaction Requires Review',
      body: `Transaction ${transaction.referenceNumber} for ${transaction.amount} ${transaction.currency} requires employee review.`,
      metadata: { transactionId: transaction.id },
    });

    return transaction;
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
      whereClause = { debitAccount: { customerId: userDb.customer.id } };
    } else {
      whereClause = {
        status: { notIn: [TransactionStatus.COMPLETED, TransactionStatus.REJECTED] }
      };
    }

    return this.prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        debitAccount: { include: { customer: { include: { user: true } } } },
        creditAccount: true,
      }
    });
  }

  async findOne(id: string, currentUser: CurrentUserPayload) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        debitAccount: { include: { customer: { include: { user: true } } } },
        creditAccount: true,
        approvals: { include: { approver: true } }
      }
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    const roles = currentUser.realm_access?.roles || [];
    const isEmployeeOrAdmin = roles.includes(UserRole.EMPLOYEE) || roles.includes(UserRole.ADMIN);

    if (!isEmployeeOrAdmin) {
      const userDb = await this.resolveCustomerUserId(currentUser.sub);
      if (!userDb?.customer || transaction.debitAccount?.customerId !== userDb.customer.id) {
        throw new ForbiddenException('You do not have access to this transaction');
      }
    }

    return transaction;
  }

  async reviewTransaction(id: string, dto: ReviewTransactionDto, currentUser: CurrentUserPayload) {
    const userDb = await this.prisma.user.findUnique({ where: { keycloakId: currentUser.sub } });
    if (!userDb) throw new ForbiddenException('User not found in DB');

    const roles = currentUser.realm_access?.roles || [];
    const isEmployee = roles.includes(UserRole.EMPLOYEE);
    const isAdmin = roles.includes(UserRole.ADMIN);

    if (!isEmployee && !isAdmin) {
      throw new ForbiddenException('Only employees or admins can review transactions');
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { debitAccount: true, creditAccount: true }
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.COMPLETED || transaction.status === TransactionStatus.REJECTED) {
      throw new BadRequestException('Transaction is already processed');
    }

    // Determine current stage
    let currentStage: ApprovalStage = ApprovalStage.EMPLOYEE_REVIEW;
    if (transaction.status === TransactionStatus.ADMIN_REVIEW) {
      currentStage = ApprovalStage.ADMIN_FINAL;
    } else if (transaction.status !== TransactionStatus.PENDING && transaction.status !== TransactionStatus.EMPLOYEE_REVIEW) {
      // If it is in some other state, we can't review it
      throw new BadRequestException(`Cannot review transaction in status: ${transaction.status}`);
    }

    if (currentStage === ApprovalStage.ADMIN_FINAL && !isAdmin) {
      throw new ForbiddenException('Only admins can review this transaction');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Create Approval Record
      await tx.approval.create({
        data: {
          transactionId: transaction.id,
          stage: currentStage,
          decision: dto.decision,
          reason: dto.decision === ApprovalDecision.REJECTED ? dto.reason : dto.approvedReason,
          approverId: userDb.id,
        }
      });

      // 2. Determine Next Status
      let nextStatus = transaction.status;

      if (dto.decision === ApprovalDecision.REJECTED) {
        nextStatus = TransactionStatus.REJECTED;
      } else {
        if (currentStage === ApprovalStage.EMPLOYEE_REVIEW) {
          if (Number(transaction.amount) > 10000) {
            nextStatus = TransactionStatus.ADMIN_REVIEW;
          } else {
            nextStatus = TransactionStatus.COMPLETED;
          }
        } else if (currentStage === ApprovalStage.ADMIN_FINAL) {
          nextStatus = TransactionStatus.COMPLETED;
        }
      }

      // 3. Update Transaction
      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: nextStatus,
          processedAt: nextStatus === TransactionStatus.COMPLETED || nextStatus === TransactionStatus.REJECTED ? new Date() : undefined
        },
      });

      // 4. Update Ledger if COMPLETED
      if (nextStatus === TransactionStatus.COMPLETED) {
        if (transaction.debitAccountId) {
          await this.ledgerService.recordDebit(transaction.id, transaction.debitAccountId, transaction.amount, tx);
        }
        if (transaction.creditAccountId) {
          await this.ledgerService.recordCredit(transaction.id, transaction.creditAccountId, transaction.amount, tx);
        }
      }

      // 5. Send Notification & Audit
      await this.auditLogService.log({
        entityType: 'TRANSACTION',
        entityId: transaction.id,
        action: `REVIEWED_${dto.decision}`,
        actorId: userDb.id,
        after: updatedTx as unknown as Record<string, unknown>,
      });

      if (transaction.debitAccount && transaction.debitAccount.customer) {
        await this.rabbitMQClient.publish(`bankcore.notifications.customer.${transaction.debitAccount.customer.userId}`, {
          type: 'TRANSACTION_STATUS_UPDATED',
          title: 'Transaction Status Updated',
          body: `Your transaction status is now ${nextStatus}.`,
          metadata: { transactionId: transaction.id, status: nextStatus },
        });
      }

      await this.kafkaProducer.publish('bankcore.domain.events', {
        eventType: 'transaction.updated',
        payload: {
          transactionId: transaction.id,
          status: nextStatus,
          userId: transaction.debitAccount?.customerId,
          customerId: transaction.debitAccount?.customerId,
        },
      });

      return updatedTx;
    });
  }

}
