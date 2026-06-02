import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AccountSettingsDto,
  AuthSessionDto,
  ChangeEmailRequestDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SendVerificationEmailDto,
  authSessionResponseSchema,
} from '@job-tracker-lite-angular/schemas';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthDataAccessService {
  private readonly http = inject(HttpClient);

  async getSession(): Promise<AuthSessionDto> {
    const session = await firstValueFrom(
      this.http.get<AuthSessionDto>('/api/auth/get-session', {
        withCredentials: true,
      }),
    );

    const parsed = authSessionResponseSchema.safeParse(session);
    return parsed.success ? parsed.data : null;
  }

  async signIn(dto: LoginDto): Promise<AuthSessionDto> {
    await firstValueFrom(
      this.http.post(
        '/api/auth/sign-in/email',
        {
          email: dto.email,
          password: dto.password,
        },
        {
          withCredentials: true,
        },
      ),
    );

    return this.getSession();
  }

  async signUp(dto: RegisterDto): Promise<AuthSessionDto> {
    await firstValueFrom(
      this.http.post(
        '/api/auth/sign-up/email',
        {
          name: dto.name,
          email: dto.email,
          password: dto.password,
        },
        {
          withCredentials: true,
        },
      ),
    );

    return this.getSession();
  }

  async signOut(): Promise<void> {
    await firstValueFrom(
      this.http.post(
        '/api/auth/sign-out',
        {},
        {
          withCredentials: true,
        },
      ),
    );
  }

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<void> {
    const redirectTo = new URL('/auth/reset-password', window.location.origin);
    redirectTo.searchParams.set('language', dto.language);

    await firstValueFrom(
      this.http.post(
        '/api/auth/request-password-reset',
        {
          email: dto.email,
          redirectTo: redirectTo.toString(),
        },
        {
          withCredentials: true,
        },
      ),
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    await firstValueFrom(
      this.http.post(
        '/api/auth/reset-password',
        {
          newPassword: dto.newPassword,
          token: dto.token,
        },
        {
          withCredentials: true,
        },
      ),
    );
  }

  async sendVerificationEmail(dto: SendVerificationEmailDto): Promise<void> {
    await firstValueFrom(
      this.http.post(
        '/api/auth/send-verification-email',
        {
          email: dto.email,
        },
        {
          withCredentials: true,
        },
      ),
    );
  }

  async getAccountSettings(): Promise<AccountSettingsDto> {
    return await firstValueFrom(
      this.http.get<AccountSettingsDto>('/api/account', {
        withCredentials: true,
      }),
    );
  }

  async requestEmailChange(dto: ChangeEmailRequestDto): Promise<void> {
    await firstValueFrom(
      this.http.post(
        '/api/account/change-email',
        {
          newEmail: dto.newEmail,
        },
        {
          withCredentials: true,
        },
      ),
    );
  }

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await firstValueFrom(
      this.http.post(
        '/api/auth/change-password',
        {
          currentPassword: dto.currentPassword,
          newPassword: dto.newPassword,
          revokeOtherSessions: true,
        },
        {
          withCredentials: true,
        },
      ),
    );
  }
}
