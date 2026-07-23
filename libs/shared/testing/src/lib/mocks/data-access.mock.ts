import { HealthResponseDto } from '@job-tracker-lite-angular/schemas';

type HealthResourceState = {
  value: () => HealthResponseDto | null;
  isLoading: () => boolean;
  reload: () => void;
  error: () => unknown;
  hasValue: () => boolean;
};

export type HealthDataAccessMockOptions = {
  health?: HealthResponseDto | null;
  isLoading?: boolean;
  error?: unknown;
  hasValue?: boolean;
};

export function createHealthDataAccessMock(
  options: HealthDataAccessMockOptions = {},
) {
  const health = options.health ?? null;
  const isLoading = options.isLoading ?? false;
  const hasValue = options.hasValue ?? health !== null;

  const resourceState: HealthResourceState = {
    value: () => health,
    isLoading: () => isLoading,
    reload: () => undefined,
    error: () => options.error ?? null,
    hasValue: () => hasValue,
  };

  // Both resources share the same options-driven state: consumers pick whichever
  // one they depend on (the navbar uses readiness, the status page detailed).
  return {
    healthResource: resourceState,
    readinessResource: resourceState,
  };
}

export function createBackendError(errorCode: string, statusCode = 500) {
  const error = new Error(`Backend error: ${errorCode}`);
  (error as any).errorCode = errorCode;
  (error as any).statusCode = statusCode;
  return error;
}
