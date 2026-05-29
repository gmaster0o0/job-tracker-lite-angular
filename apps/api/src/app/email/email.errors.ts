import { HttpException, HttpStatus } from '@nestjs/common';

export const EMAIL_ERROR_CODES = {
  SEND_FAILED: 'email_send_failed',
} as const;

export class EmailSendException extends HttpException {
  constructor(cause?: unknown) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to send email',
        errorCode: EMAIL_ERROR_CODES.SEND_FAILED,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        cause: cause instanceof Error ? cause : undefined,
      },
    );
  }
}
