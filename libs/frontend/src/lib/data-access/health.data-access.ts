import { Injectable } from '@angular/core';
import { httpResource, HttpErrorResponse } from '@angular/common/http';
import { HealthResponseDto } from '@job-tracker-lite-angular/schemas';

@Injectable({
  providedIn: 'root',
})
export class HealthDataAccessService {
  healthResource = httpResource<HealthResponseDto>(
    () => `/api/health/detailed`,
  );
}

export interface HealthResourceLike {
  hasValue(): boolean;
  value(): HealthResponseDto | undefined | null;
  isLoading(): boolean;
  error(): unknown;
}

/**
 * Resolves the health payload from a resource, falling back to the body of a
 * 503 error response - Terminus returns the same shape on that status.
 */
export function selectHealthValue(
  resource: HealthResourceLike,
): HealthResponseDto | null {
  if (resource.hasValue()) {
    return resource.value() ?? null;
  }

  const err = resource.error();
  if (err instanceof HttpErrorResponse && err.status === 503 && err.error) {
    return err.error as HealthResponseDto;
  }

  return null;
}

/**
 * True when the backend isn't reporting a degraded status but is not
 * responding at all (connection refused, proxy timeout, etc.).
 */
export function isHealthUnreachable(
  resource: HealthResourceLike,
  health: HealthResponseDto | null,
): boolean {
  if (health !== null || resource.isLoading()) {
    return false;
  }

  const err = resource.error();
  return err instanceof HttpErrorResponse && err.status === 0;
}
