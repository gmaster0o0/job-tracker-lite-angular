import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Response } from 'express';
import {
  BETTER_AUTH_ERROR_CODE_MESSAGES,
  BETTER_AUTH_ERROR_CODES,
  BETTER_AUTH_STATUS_MAP,
} from './better-auth-error.constants';

interface BetterAuthError {
  status: number | string;
  body?: { code?: string; message?: string };
  message?: string;
}

function isBetterAuthError(exception: unknown): exception is BetterAuthError {
  return (
    typeof exception === 'object' && exception !== null && 'status' in exception
  );
}

@Catch()
export class BetterAuthExceptionFilter extends BaseExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost) {
    if (!isBetterAuthError(exception)) {
      return super.catch(exception, host);
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorCode = exception.body?.code || exception.status?.toString();
    const statusCode = this.resolveStatusCode(exception, errorCode);

    const message =
      exception.body?.message ||
      (errorCode ? BETTER_AUTH_ERROR_CODE_MESSAGES[errorCode] : null) ||
      exception.message ||
      'Authentication error';

    return response.status(statusCode).json({
      statusCode,
      errorCode: errorCode || BETTER_AUTH_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message,
    });
  }

  private resolveStatusCode(
    exception: BetterAuthError,
    errorCode?: string,
  ): number {
    if (typeof exception.status === 'number') {
      return exception.status;
    }

    if (errorCode && BETTER_AUTH_STATUS_MAP[errorCode]) {
      return BETTER_AUTH_STATUS_MAP[errorCode];
    }
    if (
      typeof exception.status === 'string' &&
      BETTER_AUTH_STATUS_MAP[exception.status]
    ) {
      return BETTER_AUTH_STATUS_MAP[exception.status];
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
