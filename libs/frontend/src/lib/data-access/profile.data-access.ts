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

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    return await firstValueFrom(
      this.http.get<UserProfileDto>(`/api/users/${userId}/profile`),
    );
  }

  async updateProfile(dto: UpdateUserProfileDto): Promise<UserProfileDto> {
    const updated = await firstValueFrom(
      this.http.patch<UserProfileDto>('/api/profile', dto),
    );
    this.profileResource.update(() => updated);

    return updated;
  }

  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    return await firstValueFrom(
      this.http.patch<UserProfileDto>(`/api/users/${userId}/profile`, dto),
    );
  }
}
