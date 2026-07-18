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
import { PRISMA_ERROR_CODES } from '@job-tracker-lite-angular/prisma/error-codes';
import { backendErrorInterceptor } from './backend-error.interceptor';
import { NotificationService } from '../services/notification.service';
import { createNotificationServiceMock } from '@job-tracker-lite-angular/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';

const en = {
  errors: {
    global: {
      title: 'System Error',
      network:
        'Cannot connect to the server. Please check your internet connection.',
      internal: 'An unexpected error occurred. Please try again later.',
    },
  },
};

const hu = {
  errors: {
    global: {
      title: 'Rendszerhiba',
      network:
        'Nem sikerült csatlakozni a szerverhez. Kérjük, ellenőrizze az internetkapcsolatot.',
      internal: 'Váratlan hiba történt. Kérjük, próbálja újra később.',
    },
  },
};

describe('backendErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let notificationMock: ReturnType<typeof createNotificationServiceMock>;

  beforeEach(() => {
    notificationMock = createNotificationServiceMock();
    vi.spyOn(notificationMock, 'error');

    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en, hu },
          translocoConfig: {
            availableLangs: ['en', 'hu'],
            defaultLang: 'en',
          },
          preloadLangs: true,
        }),
      ],
      providers: [
        provideHttpClient(withInterceptors([backendErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notificationMock },
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
    expect(notificationMock.error).toHaveBeenCalled();
  });

  it('shows toast for network error', async () => {
    const request = firstValueFrom(httpClient.get('/api/test'));

    const req = httpMock.expectOne('/api/test');
    req.flush(null, { status: 0, statusText: 'Unknown Error' });

    await expect(request).rejects.toBeDefined();
    expect(notificationMock.error).toHaveBeenCalledWith(
      'System Error',
      'Cannot connect to the server. Please check your internet connection.',
    );
  });

  it('does not show toast for silent errors like 400', async () => {
    const request = firstValueFrom(httpClient.get('/api/test'));

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { message: 'Bad request' },
      { status: 400, statusText: 'Bad Request' },
    );

    await expect(request).rejects.toBeDefined();
    expect(notificationMock.error).not.toHaveBeenCalled();
  });
});
