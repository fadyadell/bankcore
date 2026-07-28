import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ERROR_CODES, CORRELATION_ID_HEADER } from '../constants/index.js';
import type { ApiErrorResponse } from '../interfaces/api-response.interface.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorCode: string;
    let message: string;
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp['message'] as string) || exception.message;
        errorCode = (resp['error'] as string) || this.statusToErrorCode(status);
        if (Array.isArray(resp['message'])) {
          details = { validationErrors: resp['message'] };
          message = 'Validation failed';
          errorCode = ERROR_CODES.VALIDATION_ERROR;
        }
      } else {
        message = exception.message;
        errorCode = this.statusToErrorCode(status);
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = ERROR_CODES.INTERNAL_ERROR;
      message = 'An unexpected error occurred';

      this.logger.error(
        `Unhandled exception: ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const correlationId = request.headers[CORRELATION_ID_HEADER] as string | undefined;

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
      correlationId,
    };

    response.status(status).json(errorResponse);
  }

  private statusToErrorCode(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: ERROR_CODES.VALIDATION_ERROR,
      [HttpStatus.UNAUTHORIZED]: ERROR_CODES.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ERROR_CODES.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ERROR_CODES.NOT_FOUND,
      [HttpStatus.CONFLICT]: ERROR_CODES.CONFLICT,
      [HttpStatus.TOO_MANY_REQUESTS]: ERROR_CODES.RATE_LIMITED,
    };
    return map[status] || ERROR_CODES.INTERNAL_ERROR;
  }
}
