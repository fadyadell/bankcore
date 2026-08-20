import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { FlowableClient } from './flowable.client';
import { PrismaService } from '@bankcore/prisma-client';
export interface CurrentUserPayload {
  sub: string;
  email: string;
  realm_access?: { roles: string[] };
}
import { CompleteTaskDto } from './dto/complete-task.dto';
import { AuditLogService } from '@bankcore/common';
import { KafkaProducerService } from '@bankcore/messaging';
import * as path from 'path';

@Injectable()
export class WorkflowService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private readonly flowableClient: FlowableClient,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async onModuleInit() {
    await this.deployProcesses();
  }

  async deployProcesses() {
    try {
      const transactionBpmnPath = path.join(__dirname, 'src', 'bpmn', 'transaction-approval.bpmn20.xml');
      const loanBpmnPath = path.join(__dirname, 'src', 'bpmn', 'loan-approval.bpmn20.xml');

      await this.flowableClient.deployProcess(transactionBpmnPath);
      await this.flowableClient.deployProcess(loanBpmnPath);
      this.logger.log('BPMN processes deployed successfully.');
    } catch (error) {
      this.logger.error('Failed to deploy BPMN processes on startup', error);
    }
  }

  async startTransactionWorkflow(transactionId: string): Promise<string> {
    const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) throw new BadRequestException('Transaction not found');

    const { processInstanceId } = await this.flowableClient.startProcess('transactionApproval', {
      transactionId,
      amount: Number(transaction.amount),
      description: transaction.description || '',
      type: transaction.type,
      decision: ''
    });

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { metadata: { flowableProcessId: processInstanceId } }
    });

    await this.kafkaProducer.publish('bankcore.transaction.created', { entityId: transactionId });

    return processInstanceId;
  }

  async startLoanWorkflow(loanId: string): Promise<string> {
    const { processInstanceId } = await this.flowableClient.startProcess('loanApproval', {
      loanId,
      decision: ''
    });



    await this.kafkaProducer.publish('bankcore.loan.applied', { entityId: loanId });

    return processInstanceId;
  }

  async getMyTasks(currentUser: CurrentUserPayload): Promise<unknown[]> {
    const roles = currentUser.realm_access?.roles || [];
    const groups: string[] = [];
    if (roles.includes('employee')) groups.push('EMPLOYEE');
    if (roles.includes('admin')) groups.push('ADMIN');

    let allTasks: unknown[] = [];
    for (const group of groups) {
      const tasks = await this.flowableClient.getTasksForGroup(group);
      allTasks = allTasks.concat(tasks);
    }

    for (const task of allTasks) {
      const vars = await this.flowableClient.getProcessVariables((task as { processInstanceId: string }).processInstanceId);
      (task as Record<string, unknown>).variables = vars;
    }

    return allTasks;
  }

  async claimTask(taskId: string, currentUser: CurrentUserPayload): Promise<void> {
    await this.flowableClient.claimTask(taskId, currentUser.sub);
  }

  async completeTask(taskId: string, dto: CompleteTaskDto, currentUser: CurrentUserPayload): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { keycloakId: currentUser.sub } });
    if (!user) throw new BadRequestException('User not found');

    const task = await this.flowableClient.getTask(taskId) as { processInstanceId: string, taskDefinitionKey: string };
    const vars = await this.flowableClient.getProcessVariables(task.processInstanceId);

    const transactionId = vars['transactionId'] as string | undefined;
    const loanId = vars['loanId'] as string | undefined;

    if (transactionId) {
      await this.prisma.approval.create({
        data: {
          entityType: 'TRANSACTION',
          entityId: transactionId,
          role: task.taskDefinitionKey.includes('admin') ? 'ADMIN_FINAL' : 'EMPLOYEE_REVIEW',
          status: dto.decision as any,
          comments: dto.reason,
          reviewerId: user.id,
        }
      });

      if (dto.decision === 'APPROVED' && task.taskDefinitionKey === 'employeeReview') {
        await this.prisma.transaction.update({
          where: { id: transactionId },
          data: { status: 'PROCESSING' }
        });
        await this.kafkaProducer.publish('bankcore.transaction.approved', { entityId: transactionId });
      }
    } else if (loanId) {
      await this.prisma.approval.create({
        data: {
          entityType: 'LOAN',
          entityId: loanId,
          role: task.taskDefinitionKey.includes('admin') ? 'ADMIN_FINAL' : 'EMPLOYEE_REVIEW',
          status: dto.decision as any,
          comments: dto.reason,
          reviewerId: user.id,
        }
      });

      if (dto.decision === 'APPROVED' && (
        task.taskDefinitionKey === 'highRiskReview' || 
        task.taskDefinitionKey === 'standardReview' || 
        task.taskDefinitionKey === 'fastTrackReview'
      )) {
        await this.prisma.loan.update({
          where: { id: loanId },
          data: { status: 'REVIEWING' }
        });
      }
    }

    await this.flowableClient.completeTask(taskId, {
      decision: dto.decision,
      reason: dto.reason || ''
    });

    await this.auditLogService.log({
      entityType: transactionId ? 'TRANSACTION' : 'LOAN',
      entityId: (transactionId || loanId) as string,
      action: 'TASK_COMPLETED',
      metadata: { actorId: user.id, after: { taskId, taskKey: task.taskDefinitionKey, decision: dto.decision } }
    });
  }
}
