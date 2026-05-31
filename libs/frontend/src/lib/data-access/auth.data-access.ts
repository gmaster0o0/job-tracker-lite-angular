import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AuthSessionDto,
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
    const callbackTo = new URL('/auth/verify-email', window.location.origin);
    callbackTo.searchParams.set('language', dto.language);

    await firstValueFrom(
      this.http.post(
        '/api/auth/send-verification-email',
        {
          email: dto.email,
          callbackURL: callbackTo.toString(),
        },
        {
          withCredentials: true,
        },
      ),
    );
  }
}
