import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  UpdateUserRoleDto,
  UserListItemDto,
  UserDetailsDto,
} from '@job-tracker-lite-angular/schemas';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersDataAccessService {
  private readonly http = inject(HttpClient);

  async listUsers(): Promise<UserListItemDto[]> {
    return firstValueFrom(this.http.get<UserListItemDto[]>('/api/users'));
  }

  async getUser(slug: string): Promise<UserListItemDto> {
    return firstValueFrom(this.http.get<UserListItemDto>(`/api/users/${slug}`));
  }

  async getUserProfile(idOrSlug: string): Promise<UserDetailsDto> {
    return firstValueFrom(
      this.http.get<UserDetailsDto>(`/api/users/${idOrSlug}/profile`),
    );
  }

  async updateUserRole(
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<UserListItemDto> {
    return firstValueFrom(
      this.http.patch<UserListItemDto>(`/api/users/${userId}/role`, dto),
    );
  }
}
