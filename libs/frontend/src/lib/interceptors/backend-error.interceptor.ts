import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { BackendError } from './backend-error.types';
import { PRISMA_ERROR_CODES } from '@job-tracker-lite-angular/prisma/error-codes';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { translateSignal } from '@jsverse/transloco';

const SILENT_ERROR_STATUSES = [400, 401, 403, 404, 409, 422];

function isHealthCheckRequest(url: string): boolean {
  return url.includes('/health/');
}

// The session check fires on every app bootstrap (AuthSessionService,
// wired via APP_INITIALIZER) to silently probe "is anyone logged in?" -
// callers already treat a failure as "no session" and never surface it.
// A backend hiccup (e.g. the DB being temporarily unreachable) shouldn't
// pop a scary global error toast for what's meant to be an invisible check.
function isSessionCheckRequest(url: string): boolean {
  return url.split('?')[0].endsWith('/auth/get-session');
}

/**
 * HTTP interceptor that normalizes backend errors into a consistent BackendError shape.
 * This keeps components free from HttpErrorResponse handling logic.
 */
export const backendErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const injector = inject(Injector);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (isHealthCheckRequest(req.url)) {
          return throwError(() => error);
        }

        const normalizedError = normalizeHttpError(error);

        // Show global toast for non-silent errors (e.g. 500, network errors)
        if (
          !SILENT_ERROR_STATUSES.includes(error.status) &&
          !isSessionCheckRequest(req.url)
        ) {
          runInInjectionContext(injector, () => {
            const title = translateSignal('errors.global.title', {
              defaultValue: 'System Error',
            });
            const message =
              error.status === 0
                ? translateSignal('errors.global.network', {
                    defaultValue:
                      'Cannot connect to the server. Please check your internet connection.',
                  })
                : translateSignal('errors.global.internal', {
                    defaultValue:
                      'An unexpected error occurred. Please try again later.',
                  });

            notification.error(title(), message());
          });
        }

        return throwError(() => normalizedError);
      }
      // Non-HTTP errors pass through unchanged
      return throwError(() => error);
    }),
  );
};
/**
 * Transforms an HttpErrorResponse into a normalized BackendError with consistent properties.
 * @param httpError The HttpErrorResponse to normalize.
 * @returns A BackendError with normalized properties.
 */
function normalizeHttpError(httpError: HttpErrorResponse): BackendError {
  const payload = httpError.error;
  const errorCode = extractErrorCode(payload);
  const originalMessage = extractMessage(payload);

  const backendError = new Error(`Backend error: ${errorCode}`) as BackendError;

  // Attach normalized properties
  backendError.errorCode = errorCode;
  backendError.statusCode = httpError.status;
  backendError.originalMessage = originalMessage;

  return backendError;
}

/**
 * Extracts a normalized error code from the backend error payload, with fallbacks.
 * @param payload The backend error payload.
 * @returns The extracted error code, or a default internal server error code if not available.
 */
function extractErrorCode(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return PRISMA_ERROR_CODES.INTERNAL_SERVER_ERROR;
  }

  const data = payload as Record<string, unknown>;
  const errorCode = data['errorCode'] ?? data['code'];
  return typeof errorCode === 'string' && errorCode.trim().length > 0
    ? errorCode.trim()
    : PRISMA_ERROR_CODES.INTERNAL_SERVER_ERROR;
}

/**
 * Extracts a message from the backend error payload, if available.
 * @param payload The backend error payload.
 * @returns The extracted message, or undefined if not available.
 */
function extractMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const data = payload as Record<string, unknown>;
  const message = data['message'];
  return typeof message === 'string' ? message : undefined;
}
