import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BetterAuthExceptionFilter } from './better-auth-exception.filter';

type MockBody = { message: string; code?: string };

jest.mock('better-auth/api', () => {
  class MockAPIError {
    status: string | number;
    body: MockBody;
    message: string;

    constructor(status: string | number, body: MockBody) {
      this.status = status;
      this.body = body;
      this.message = body.message;
    }
  }

  return {
    APIError: MockAPIError,
    isAPIError: (error: unknown): error is MockAPIError =>
      error instanceof MockAPIError,
  };
});

describe('BetterAuthExceptionFilter', () => {
  let filter: BetterAuthExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new BetterAuthExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    };
  });

  it('should serialize USER_ALREADY_EXISTS with conflict status', () => {
    const { APIError } = require('better-auth/api');
    const error = new APIError('BAD_REQUEST', {
      message: 'User already exists',
      code: 'USER_ALREADY_EXISTS',
    });

    filter.catch(error as any, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      errorCode: 'USER_ALREADY_EXISTS',
      message: 'User already exists',
    });
  });

  it('should serialize UNAUTHORIZED status when code is missing', () => {
    const { APIError } = require('better-auth/api');
    const error = new APIError('UNAUTHORIZED', {
      message: 'Session not found',
    });

    filter.catch(error as any, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      errorCode: 'UNAUTHORIZED',
      message: 'Session not found',
    });
  });

  it('should fallback to INTERNAL_SERVER_ERROR for unknown status strings', () => {
    const { APIError } = require('better-auth/api');
    const error = new APIError('UNKNOWN_ERROR' as any, {
      message: 'Panic',
    });

    filter.catch(error as any, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'UNKNOWN_ERROR',
      message: 'Panic',
    });
  });

  it('should re-throw non-BetterAuth exceptions', () => {
    const nonAuthError = new Error('Not a Better Auth error');

    expect(() =>
      filter.catch(nonAuthError, mockArgumentsHost as ArgumentsHost),
    ).toThrow('Not a Better Auth error');
  });
});
