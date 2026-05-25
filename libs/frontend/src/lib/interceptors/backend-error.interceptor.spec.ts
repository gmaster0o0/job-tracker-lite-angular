import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { PRISMA_ERROR_CODES } from '@job-tracker-lite-angular/prisma';
import { backendErrorInterceptor } from './backend-error.interceptor';

describe('backendErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([backendErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('normalizes backend error with errorCode', async () => {
    const request = firstValueFrom(httpClient.get('/api/test'));

    const req = httpMock.expectOne('/api/test');
    req.flush(
      {
        errorCode: PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION,
        message: 'Unique constraint failed',
      },
      { status: 409, statusText: 'Conflict' },
    );

    await expect(request).rejects.toEqual(
      expect.objectContaining({
        errorCode: PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION,
        statusCode: 409,
        originalMessage: 'Unique constraint failed',
      }),
    );
  });

  it('normalizes backend error with code fallback', async () => {
    const request = firstValueFrom(httpClient.get('/api/test'));

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { code: PRISMA_ERROR_CODES.RECORD_NOT_FOUND },
      { status: 404, statusText: 'Not Found' },
    );

    await expect(request).rejects.toEqual(
      expect.objectContaining({
        errorCode: PRISMA_ERROR_CODES.RECORD_NOT_FOUND,
        statusCode: 404,
      }),
    );
  });

  it('uses internal server error code when no error code provided', async () => {
    const request = firstValueFrom(httpClient.get('/api/test'));

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { message: 'Internal server error' },
      { status: 500, statusText: 'Internal Server Error' },
    );

    await expect(request).rejects.toEqual(
      expect.objectContaining({
        errorCode: PRISMA_ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: 500,
      }),
    );
  });
});
