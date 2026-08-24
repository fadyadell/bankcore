import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import FormData from 'form-data';
// We use basic auth config globally in axios, or per request.

@Injectable()
export class FlowableClient {
  private readonly logger = new Logger(FlowableClient.name);
  private readonly baseUrl = process.env.FLOWABLE_REST_URL || 'http://localhost:8081/flowable-rest/service';
  private readonly auth = { username: 'rest-admin', password: 'test' };

  constructor(private readonly httpService: HttpService) {}

  async deployProcess(bpmnFilePath: string, tenantId: string = ''): Promise<void> {
    try {
      const fileStream = fs.createReadStream(bpmnFilePath);
      const formData = new FormData();
      formData.append('file', fileStream);
      if (tenantId) {
        formData.append('tenantId', tenantId);
      }

      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/repository/deployments`, formData, {
          auth: this.auth,
          headers: formData.getHeaders(),
        })
      );
      this.logger.log(`Deployed process: ${bpmnFilePath}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to deploy ${bpmnFilePath}: ${msg}`);
    }
  }

  async startProcess(processKey: string, variables: Record<string, unknown>): Promise<{ processInstanceId: string }> {
    const vars = Object.keys(variables).map(key => ({
      name: key,
      value: variables[key]
    }));

    const payload = {
      processDefinitionKey: processKey,
      variables: vars,
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/runtime/process-instances`, payload, {
        auth: this.auth,
      })
    );

    const data = response.data as { id: string };
    return { processInstanceId: data.id };
  }

  async getTasksForGroup(group: string): Promise<unknown[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/runtime/tasks`, {
        params: { candidateGroup: group, size: 50 },
        auth: this.auth,
      })
    );
    const data = response.data as { data: unknown[] };
    return data.data;
  }

  async claimTask(taskId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/runtime/tasks/${taskId}`, {
        action: 'claim',
        assignee: userId
      }, {
        auth: this.auth,
      })
    );
  }

  async completeTask(taskId: string, variables: Record<string, unknown>): Promise<void> {
    const vars = Object.keys(variables).map(key => ({
      name: key,
      value: variables[key]
    }));

    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/runtime/tasks/${taskId}`, {
        action: 'complete',
        variables: vars
      }, {
        auth: this.auth,
      })
    );
  }

  async getProcessInstance(processInstanceId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/runtime/process-instances/${processInstanceId}`, {
        auth: this.auth,
      })
    );
    return response.data as unknown;
  }

  async getProcessVariables(processInstanceId: string): Promise<Record<string, unknown>> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/runtime/process-instances/${processInstanceId}/variables`, {
        auth: this.auth,
      })
    );
    const vars = response.data as { name: string; value: unknown }[];
    const result: Record<string, unknown> = {};
    if (Array.isArray(vars)) {
      vars.forEach(v => result[v.name] = v.value);
    }
    return result;
  }
  
  async getTask(taskId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/runtime/tasks/${taskId}`, {
        auth: this.auth,
      })
    );
    return response.data as unknown;
  }
}
