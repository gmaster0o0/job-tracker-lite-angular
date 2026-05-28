import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  BETTER_AUTH_ERROR_CODE_MESSAGES,
  BETTER_AUTH_ERROR_CODES,
  BETTER_AUTH_HTTP_STATUS_MAP,
  BETTER_AUTH_STATUS_CODES,
} from './better-auth-error.constants';

// Runtime shape of the better-auth APIError (the published TS type is incomplete)
interface BetterAuthError {
  status: number | string;
  statusCode?: number;
  body?: { code?: string; message?: string };
  message?: string;
}

function isBetterAuthError(exception: unknown): exception is BetterAuthError {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'status' in exception &&
    'body' in exception
  );
}

@Catch()
export class BetterAuthExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (!isBetterAuthError(exception)) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorCode = exception.body?.code || exception.status?.toString();

    const statusCode =
      typeof exception.status === 'number'
        ? exception.status
        : errorCode && BETTER_AUTH_STATUS_CODES[errorCode]
          ? BETTER_AUTH_STATUS_CODES[errorCode]
          : typeof exception.status === 'string' &&
              BETTER_AUTH_HTTP_STATUS_MAP[exception.status]
            ? BETTER_AUTH_HTTP_STATUS_MAP[exception.status]
            : HttpStatus.INTERNAL_SERVER_ERROR;

    return response.status(statusCode).json({
      statusCode,
      errorCode: errorCode || BETTER_AUTH_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message:
        exception.body?.message ||
        (errorCode ? BETTER_AUTH_ERROR_CODE_MESSAGES[errorCode] : null) ||
        exception.message,
    });
  }
}
