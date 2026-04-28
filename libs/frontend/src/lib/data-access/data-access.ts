import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { User } from '@job-tracker-lite-angular/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class DataAccessService {
  userResource = httpResource<User>(() => `/api`);
}
