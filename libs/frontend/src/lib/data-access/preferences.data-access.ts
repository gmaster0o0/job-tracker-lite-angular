import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  UpdateUserPreferencesDto,
  UserPreferencesDto,
  userPreferencesSchema,
} from '@job-tracker-lite-angular/schemas';

// No eager httpResource here (unlike ProfileDataAccessService) - this
// service is transitively constructed by preferencesInitGuard on every
// route load, including for guests, so an unconditional GET would fire a
// doomed request on every anonymous page view. UserPreferencesService calls
// these methods explicitly, only once a session is known to be authenticated.
@Injectable({
  providedIn: 'root',
})
export class PreferencesDataAccessService {
  private readonly http = inject(HttpClient);

  async getPreferences(): Promise<UserPreferencesDto> {
    const response = await firstValueFrom(
      this.http.get<UserPreferencesDto>('/api/preferences'),
    );
    return userPreferencesSchema.parse(response);
  }

  async updatePreferences(
    dto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesDto> {
    const response = await firstValueFrom(
      this.http.patch<UserPreferencesDto>('/api/preferences', dto),
    );
    return userPreferencesSchema.parse(response);
  }
}
