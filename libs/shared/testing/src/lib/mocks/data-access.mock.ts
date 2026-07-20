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

  const healthResource: HealthResourceState = {
    value: () => health,
    isLoading: () => isLoading,
    reload: () => undefined,
    error: () => options.error ?? null,
    hasValue: () => hasValue,
  };

  return {
    healthResource,
  };
}

export function createBackendError(errorCode: string, statusCode = 500) {
  const error = new Error(`Backend error: ${errorCode}`);
  (error as any).errorCode = errorCode;
  (error as any).statusCode = statusCode;
  return error;
}
