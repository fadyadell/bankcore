import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { CurrentUser } from '@bankcore/common';
import type { JwtPayload } from '@bankcore/common';
import { JwtAuthGuard, RolesGuard } from '@bankcore/auth';
import { RejectTransactionDelegate } from './delegates/reject-transaction.delegate';
import { ExecuteTransferDelegate } from './delegates/execute-transfer.delegate';
import { EvaluateLoanRiskDelegate } from './delegates/evaluate-loan-risk.delegate';
import { ApproveLoanDelegate } from './delegates/approve-loan.delegate';
import { RejectLoanDelegate } from './delegates/reject-loan.delegate';
import { VerifyNationalIdDelegate } from './delegates/verify-national-id.delegate';
import { VerifyTaxDelegate } from './delegates/verify-tax.delegate';

@Controller()
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly rejectTransactionDelegate: RejectTransactionDelegate,
    private readonly executeTransferDelegate: ExecuteTransferDelegate,
    private readonly evaluateLoanRiskDelegate: EvaluateLoanRiskDelegate,
    private readonly approveLoanDelegate: ApproveLoanDelegate,
    private readonly rejectLoanDelegate: RejectLoanDelegate,
    private readonly verifyNationalIdDelegate: VerifyNationalIdDelegate,
    private readonly verifyTaxDelegate: VerifyTaxDelegate,
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

  @Post('delegates/verify-national-id')
  async delegateVerifyNationalId(@Body() body: { loanId: string }) {
    await this.verifyNationalIdDelegate.execute(body.loanId);
    return { success: true };
  }

  @Post('delegates/verify-tax')
  async delegateVerifyTax(@Body() body: { loanId: string }) {
    await this.verifyTaxDelegate.execute(body.loanId);
    return { success: true };
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
    return { processInstanceId };
  }

  @Post('workflows/loan/:id/start')
  async startLoan(@Param('id') id: string) {
    const processInstanceId = await this.workflowService.startLoanWorkflow(id);
    return { processInstanceId };
  }

  @Get('tasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTasks(@CurrentUser() user: JwtPayload) {
    const result = await this.workflowService.getMyTasks(user);
    return result;
  }

  @Post('tasks/:id/claim')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async claimTask(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.workflowService.claimTask(id, user);
    return { message: 'Task claimed' };
  }

  @Post('tasks/:id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async completeTask(@Param('id') id: string, @Body() dto: CompleteTaskDto, @CurrentUser() user: JwtPayload) {
    await this.workflowService.completeTask(id, dto, user);
    return { message: 'Task completed' };
  }
}
