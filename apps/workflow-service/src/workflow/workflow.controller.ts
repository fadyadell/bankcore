import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { ResponseDto } from '@bankcore/common';
import { CurrentUser, CurrentUserPayload, KeycloakAuthGuard, RolesGuard } from '@bankcore/auth';
import { RejectTransactionDelegate } from './delegates/reject-transaction.delegate';
import { ExecuteTransferDelegate } from './delegates/execute-transfer.delegate';
import { EvaluateLoanRiskDelegate } from './delegates/evaluate-loan-risk.delegate';
import { ApproveLoanDelegate } from './delegates/approve-loan.delegate';
import { RejectLoanDelegate } from './delegates/reject-loan.delegate';

@Controller()
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly rejectTransactionDelegate: RejectTransactionDelegate,
    private readonly executeTransferDelegate: ExecuteTransferDelegate,
    private readonly evaluateLoanRiskDelegate: EvaluateLoanRiskDelegate,
    private readonly approveLoanDelegate: ApproveLoanDelegate,
    private readonly rejectLoanDelegate: RejectLoanDelegate,
  ) {}

  // Flowable HTTP delegates endpoints (Called by Flowable)
  @Post('delegates/reject-transaction')
  async delegateRejectTransaction(@Body() body: { transactionId: string, reason: string }) {
    await this.rejectTransactionDelegate.execute(body.transactionId, body.reason);
    return { success: true };
  }

  @Post('delegates/execute-transfer')
  async delegateExecuteTransfer(@Body() body: { transactionId: string }) {
    console.log('============= delegateExecuteTransfer HIT! =============', body);
    await this.executeTransferDelegate.execute(body.transactionId);
    return { success: true };
  }

  @Post('delegates/evaluate-loan-risk')
  async delegateEvaluateLoanRisk(@Body() body: { loanId: string }) {
    const result = await this.evaluateLoanRiskDelegate.execute(body.loanId);
    return result; // returning { riskTier: '...' } mapped in saveResponseVariableAsJson
  }

  @Post('delegates/approve-loan')
  async delegateApproveLoan(@Body() body: { loanId: string }) {
    await this.approveLoanDelegate.execute(body.loanId);
    return { success: true };
  }

  @Post('delegates/reject-loan')
  async delegateRejectLoan(@Body() body: { loanId: string }) {
    await this.rejectLoanDelegate.execute(body.loanId);
    return { success: true };
  }

  // Internal Endpoints (Called by other microservices)
  @Post('workflows/transaction/:id/start')
  async startTransaction(@Param('id') id: string) {
    const processInstanceId = await this.workflowService.startTransactionWorkflow(id);
    return ResponseDto.success({ processInstanceId });
  }

  @Post('workflows/loan/:id/start')
  async startLoan(@Param('id') id: string) {
    const processInstanceId = await this.workflowService.startLoanWorkflow(id);
    return ResponseDto.success({ processInstanceId });
  }

  @Get('tasks')
  @UseGuards(KeycloakAuthGuard, RolesGuard)
  async getTasks(@CurrentUser() user: CurrentUserPayload) {
    const result = await this.workflowService.getMyTasks(user);
    return ResponseDto.success(result);
  }

  @Post('tasks/:id/claim')
  @UseGuards(KeycloakAuthGuard, RolesGuard)
  async claimTask(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.workflowService.claimTask(id, user);
    return ResponseDto.success({ message: 'Task claimed' });
  }

  @Post('tasks/:id/complete')
  @UseGuards(KeycloakAuthGuard, RolesGuard)
  async completeTask(@Param('id') id: string, @Body() dto: CompleteTaskDto, @CurrentUser() user: CurrentUserPayload) {
    await this.workflowService.completeTask(id, dto, user);
    return ResponseDto.success({ message: 'Task completed' });
  }
}
