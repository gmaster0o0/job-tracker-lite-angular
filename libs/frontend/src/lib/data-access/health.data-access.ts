import { Injectable } from '@angular/core';
import { httpResource, HttpErrorResponse } from '@angular/common/http';
import { HealthResponseDto } from '@job-tracker-lite-angular/schemas';

@Injectable({
  providedIn: 'root',
})
export class HealthDataAccessService {
  // Full report (database + server + redis) for the manual /status dashboard.
  healthResource = httpResource<HealthResponseDto>(
    () => `/api/health/detailed`,
  );

  // Readiness probe (dependencies required to serve traffic - the database).
  // Drives the navbar indicator: redis being down must not flag the app as
  // unhealthy there, since it isn't required to serve requests.
  readinessResource = httpResource<HealthResponseDto>(
    () => `/api/health/ready`,
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
