import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AccountDeletionStatusDto,
  DeleteAccountDto,
  accountDeletionStatusSchema,
  DeleteJobApplicationsDto,
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
    const status = await firstValueFrom(
      this.http.get<AccountDeletionStatusDto>('/api/account/delete/status', {
        withCredentials: true,
      }),
    );

    const parsed = accountDeletionStatusSchema.safeParse(status);
    return parsed.success ? parsed.data : status;
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

  async exportUserData(): Promise<Blob> {
    return await firstValueFrom(
      this.http.get('/api/account/export-data', {
        withCredentials: true,
        observe: 'response',
        responseType: 'blob',
      }),
    ).then((response) => response.body as Blob);
  }

  async deleteJobApplications(dto: DeleteJobApplicationsDto): Promise<void> {
    await firstValueFrom(
      this.http.post<void>('/api/account/delete/jobs', dto, {
        withCredentials: true,
      }),
    );
  }
}
