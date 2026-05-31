import { HttpException, HttpStatus } from '@nestjs/common';

export const EMAIL_ERROR_CODES = {
  SEND_FAILED: 'email_send_failed',
  UNSUPPORTED_PROVIDER: 'email_unsupported_provider',
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

export class UnsupportedEmailProviderException extends HttpException {
  constructor(provider: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Unsupported email provider: ${provider}`,
        errorCode: EMAIL_ERROR_CODES.UNSUPPORTED_PROVIDER,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
