import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { HealthResponseDto } from '@job-tracker-lite-angular/schemas';

@Injectable({
  providedIn: 'root',
})
export class HealthDataAccessService {
  healthResource = httpResource<HealthResponseDto>(
    () => `/api/health/detailed`,
  );
}
