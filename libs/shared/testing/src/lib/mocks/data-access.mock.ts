import { HealthResponseDto } from '@job-tracker-lite-angular/api-interfaces';

type HealthResourceState = {
  value: () => HealthResponseDto | null;
  isLoading: () => boolean;
  reload: () => void;
  error: () => unknown;
  hasValue: () => boolean;
};

export type DataAccessMockOptions = {
  health?: HealthResponseDto | null;
  isLoading?: boolean;
  error?: unknown;
  hasValue?: boolean;
};

export function createDataAccessMock(options: DataAccessMockOptions = {}) {
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
