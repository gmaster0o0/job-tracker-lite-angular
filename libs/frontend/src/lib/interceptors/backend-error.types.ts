/**
 * Normalized backend error thrown by the HTTP interceptor.
 * Components can rely on this consistent shape instead of inspecting HttpErrorResponse.
 */
export interface BackendError extends Error {
  errorCode: string;
  statusCode: number;
  originalMessage?: string;
}

/**
 * Type guard to check if an error is a normalized BackendError
 */
export function isBackendError(error: unknown): error is BackendError {
  return (
    error instanceof Error &&
    'errorCode' in error &&
    'statusCode' in error &&
    typeof (error as BackendError).errorCode === 'string' &&
    typeof (error as BackendError).statusCode === 'number'
  );
}
