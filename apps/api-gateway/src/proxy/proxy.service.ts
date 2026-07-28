import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CORRELATION_ID_HEADER } from '@bankcore/common';

interface ProxyRequestOptions {
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly serviceUrls: Record<string, string>;

  constructor(private readonly config: ConfigService) {
    this.serviceUrls = {
      iam: `http://localhost:${config.get<number>('IAM_SERVICE_PORT', 3001)}`,
      account: `http://localhost:${config.get<number>('ACCOUNT_SERVICE_PORT', 3002)}`,
      transaction: `http://localhost:${config.get<number>('TRANSACTION_SERVICE_PORT', 3003)}`,
      notification: `http://localhost:${config.get<number>('NOTIFICATION_SERVICE_PORT', 3004)}`,
    };
  }

  async forward(
    service: string,
    options: ProxyRequestOptions,
  ): Promise<unknown> {
    const baseUrl = this.serviceUrls[service];
    if (!baseUrl) {
      throw new Error(`Unknown service: ${service}`);
    }

    let url = `${baseUrl}${options.path}`;

    if (options.query && Object.keys(options.query).length > 0) {
      const params = new URLSearchParams(options.query);
      url += `?${params.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.headers?.[CORRELATION_ID_HEADER]) {
      headers[CORRELATION_ID_HEADER] = options.headers[CORRELATION_ID_HEADER];
    }

    this.logger.debug(`Proxying ${options.method} ${url}`);

    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    const responseBody = await response.text();

    if (!response.ok) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(responseBody);
      } catch {
        parsed = { message: responseBody };
      }
      const error = parsed as Record<string, unknown>;
      const err = new Error((error['message'] as string) || `Service ${service} returned ${response.status}`);
      (err as Error & { status: number }).status = response.status;
      (err as Error & { response: unknown }).response = parsed;
      throw err;
    }

    try {
      return JSON.parse(responseBody);
    } catch {
      return responseBody;
    }
  }
}
