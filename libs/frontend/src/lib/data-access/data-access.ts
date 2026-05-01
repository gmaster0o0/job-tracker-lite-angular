import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { HealthResponseDto } from '@job-tracker-lite-angular/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class DataAccessService {
  healthResource = httpResource<HealthResponseDto>(() => `/api`);
}
