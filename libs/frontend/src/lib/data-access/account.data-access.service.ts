import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AccountDeletionStatusDto,
  DeleteAccountDto,
} from '@job-tracker-lite-angular/schemas';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountDataAccessService {
  private readonly http = inject(HttpClient);

  async requestAccountDeletion(dto: DeleteAccountDto): Promise<void> {
    await firstValueFrom(
      this.http.post<void>('/api/account/delete/request', dto, {
        withCredentials: true,
      }),
    );
  }

  async getDeletionStatus(): Promise<AccountDeletionStatusDto> {
    return await firstValueFrom(
      this.http.get<AccountDeletionStatusDto>('/api/account/delete/status', {
        withCredentials: true,
      }),
    );
  }

  async recoverAccountDeletion(): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(
        '/api/account/delete/recover',
        {},
        {
          withCredentials: true,
        },
      ),
    );
  }
}
