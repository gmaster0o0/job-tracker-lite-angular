import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  UpdateUserRoleDto,
  UserListItemDto,
} from '@job-tracker-lite-angular/schemas';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersDataAccessService {
  private readonly http = inject(HttpClient);

  async listUsers(): Promise<UserListItemDto[]> {
    return firstValueFrom(this.http.get<UserListItemDto[]>('/api/users'));
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
