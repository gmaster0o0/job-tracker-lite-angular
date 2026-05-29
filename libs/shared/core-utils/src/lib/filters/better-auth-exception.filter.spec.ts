import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { BetterAuthExceptionFilter } from './better-auth-exception.filter';

describe('BetterAuthExceptionFilter', () => {
  let filter: BetterAuthExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockArgumentsHost: Partial<ArgumentsHost>;
  let superCatchSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new BetterAuthExceptionFilter();

    superCatchSpy = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => {
        // No-op for super catch
      });

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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should serialize USER_ALREADY_EXISTS with conflict status', () => {
    const error = {
      status: 'BAD_REQUEST',
      body: {
        message: 'User already exists',
        code: 'USER_ALREADY_EXISTS',
      },
    };

    filter.catch(error, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      errorCode: 'USER_ALREADY_EXISTS',
      message: 'User already exists',
    });
  });

  it('should serialize UNAUTHORIZED status when code is missing', () => {
    const error = {
      status: 'UNAUTHORIZED',
      body: {
        message: 'Session not found',
      },
    };

    filter.catch(error, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      errorCode: 'UNAUTHORIZED',
      message: 'Session not found',
    });
  });

  it('should fallback to INTERNAL_SERVER_ERROR for unknown status strings', () => {
    const error = {
      status: 'UNKNOWN_ERROR',
      body: {
        message: 'Panic',
      },
    };

    filter.catch(error, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'UNKNOWN_ERROR',
      message: 'Panic',
    });
  });

  it('should forward non-BetterAuth exceptions to the super filter', () => {
    const nonAuthError = new Error('Not a Better Auth error');

    filter.catch(nonAuthError, mockArgumentsHost as ArgumentsHost);

    expect(superCatchSpy).toHaveBeenCalledWith(nonAuthError, mockArgumentsHost);
  });
});
