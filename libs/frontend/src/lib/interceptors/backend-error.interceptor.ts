import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { BackendError } from './backend-error.types';
import { PRISMA_ERROR_CODES } from '@job-tracker-lite-angular/prisma/error-codes';

/**
 * HTTP interceptor that normalizes backend errors into a consistent BackendError shape.
 * This keeps components free from HttpErrorResponse handling logic.
 */
export const backendErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const normalizedError = normalizeHttpError(error);
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
  return typeof errorCode === 'string' && errorCode.length > 0
    ? errorCode
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
