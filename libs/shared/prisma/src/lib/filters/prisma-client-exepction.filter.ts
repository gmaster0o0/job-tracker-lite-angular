import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import { PRISMA_ERROR_CODE_MESSAGES, PRISMA_ERROR_CODES } from '../error-codes';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message:
            PRISMA_ERROR_CODE_MESSAGES[exception.code] ||
            'Unique constraint failed',
          errorCode: PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION,
        });
        break;
      }
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message:
            PRISMA_ERROR_CODE_MESSAGES[exception.code] || 'Record not found',
          errorCode: PRISMA_ERROR_CODES.RECORD_NOT_FOUND,
        });
        break;
      }
      default:
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            PRISMA_ERROR_CODE_MESSAGES[
              PRISMA_ERROR_CODES.INTERNAL_SERVER_ERROR
            ],
          errorCode: PRISMA_ERROR_CODES.INTERNAL_SERVER_ERROR,
        });
        break;
    }
  }
}
