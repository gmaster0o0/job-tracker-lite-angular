import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AuthSessionDto,
  LoginDto,
  RegisterDto,
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
}
