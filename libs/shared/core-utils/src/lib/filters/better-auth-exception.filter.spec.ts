import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BetterAuthExceptionFilter } from './better-auth-exception.filter';

jest.mock('better-auth/api', () => {
  return {
    APIError: class {
      status: string | number;
      body: any;
      message: string;
      constructor(
        status: string | number,
        body: { message: string; code?: string },
      ) {
        this.message = body.message;
        this.status = status;
        this.body = body;
      }
    },
  };
});

describe('BetterAuthExceptionFilter', () => {
  let filter: BetterAuthExceptionFilter;
  let mockResponse: any;
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

  it('should format USER_ALREADY_EXISTS correctly', () => {
    const { APIError } = require('better-auth/api');
    const error = new APIError('BAD_REQUEST', {
      message: 'User already exists',
      code: 'USER_ALREADY_EXISTS',
    });

    filter.catch(error as any, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'User already exists',
      errorCode: 'USER_ALREADY_EXISTS',
    });
  });

  it('should format INVALID_PASSWORD correctly', () => {
    const { APIError } = require('better-auth/api');
    const error = new APIError('BAD_REQUEST', {
      message: 'Invalid password',
      code: 'INVALID_PASSWORD',
    });

    filter.catch(error as any, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid password',
      errorCode: 'INVALID_PASSWORD',
    });
  });

  it('should format USER_NOT_FOUND correctly', () => {
    const { APIError } = require('better-auth/api');
    const error = new APIError('BAD_REQUEST', {
      message: 'User not found',
      code: 'USER_NOT_FOUND',
    });

    filter.catch(error as any, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'User not found',
      errorCode: 'USER_NOT_FOUND',
    });
  });

  it('should format UNAUTHORIZED status correctly when no body code is present', () => {
    const { APIError } = require('better-auth/api');
    const error = new APIError('UNAUTHORIZED', {
      message: 'Session not found',
    });

    filter.catch(error as any, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Session not found',
      errorCode: 'UNAUTHORIZED',
    });
  });

  it('should fallback to INTERNAL_SERVER_ERROR for unknown status strings', () => {
    const { APIError } = require('better-auth/api');
    const error = new APIError('UNKNOWN_ERROR' as any, { message: 'Panic' });

    filter.catch(error as any, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Panic',
      errorCode: 'UNKNOWN_ERROR',
    });
  });
});
