import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FlowableService {
  private readonly logger = new Logger(FlowableService.name);
  private readonly baseUrl =
    process.env.FLOWABLE_URL || 'http://localhost:8080/flowable-rest/service';
  private readonly auth = {
    username: process.env.FLOWABLE_USER || 'admin',
    password: process.env.FLOWABLE_PASSWORD || 'test',
  };

  async startLoanProcess(
    loanId: string,
    variables: Record<string, unknown>,
  ): Promise<string> {
    try {
      if (process.env.NODE_ENV === 'test') {
        return `mock-process-${loanId}`;
      }

      const response = await axios.post<{ id: string }>(
        `${this.baseUrl}/runtime/process-instances`,
        {
          processDefinitionKey: 'loanApprovalProcess',
          businessKey: loanId,
          variables: Object.entries(variables).map(([name, value]) => ({
            name,
            value,
          })),
        },
        { auth: this.auth, timeout: 5000 },
      );

      return response.data.id;
    } catch (error) {
      this.logger.error(
        `Flowable start process failed: ${(error as Error).message}`,
      );
      throw new Error('Workflow Engine Unavailable');
    }
  }

  async completeTask(
    taskId: string,
    variables: Record<string, unknown>,
  ): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'test') return;

      await axios.post<void>(
        `${this.baseUrl}/runtime/tasks/${taskId}`,
        {
          action: 'complete',
          variables: Object.entries(variables).map(([name, value]) => ({
            name,
            value,
          })),
        },
        { auth: this.auth, timeout: 5000 },
      );
    } catch (error) {
      this.logger.error(
        `Flowable complete task failed: ${(error as Error).message}`,
      );
      throw new Error('Workflow Engine Unavailable');
    }
  }
}
