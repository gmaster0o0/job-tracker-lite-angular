import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';

@Injectable({
  providedIn: 'root',
})
export class ProfileDataAccessService {
  private readonly http = inject(HttpClient);

  profileResource = httpResource<UserProfileDto>(() => `/api/profile`);

  async updateProfile(dto: UpdateUserProfileDto): Promise<UserProfileDto> {
    const updated = await firstValueFrom(
      this.http.patch<UserProfileDto>('/api/profile', dto),
    );
    this.profileResource.reload();

    return updated;
  }
}
