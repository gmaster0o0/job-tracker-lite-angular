import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APIError } from 'better-auth/api';
import type { Response } from 'express';
import {
  BETTER_AUTH_ERROR_CODE_MESSAGES,
  BETTER_AUTH_ERROR_CODES,
  BETTER_AUTH_HTTP_STATUS_MAP,
} from './better-auth-error.constants';

@Catch(APIError)
export class BetterAuthExceptionFilter implements ExceptionFilter {
  catch(exception: APIError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorCode = exception.body?.code || exception.status?.toString();

    const statusCode =
      typeof exception.status === 'number'
        ? exception.status
        : BETTER_AUTH_HTTP_STATUS_MAP[exception.status] ||
          HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(statusCode).json({
      statusCode,
      message:
        exception.body?.message ||
        (errorCode ? BETTER_AUTH_ERROR_CODE_MESSAGES[errorCode] : null) ||
        exception.message,
      errorCode: errorCode || BETTER_AUTH_ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
