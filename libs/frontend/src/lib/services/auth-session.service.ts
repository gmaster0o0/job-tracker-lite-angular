import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthSessionDto } from '@job-tracker-lite-angular/schemas';
import { AuthDataAccessService } from '../data-access/auth.data-access';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly authDataAccess = inject(AuthDataAccessService);
  private readonly sessionState = signal<AuthSessionDto>(null);

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionState() !== null);
  readonly userId = computed(() => this.sessionState()?.user.id ?? null);

  async loadSession(): Promise<AuthSessionDto> {
    this.authDataAccess.session.reload();
    await Promise.resolve();

    const session = this.authDataAccess.session.value() ?? null;
    this.sessionState.set(session);
    return session;
  }

  setSession(session: AuthSessionDto): void {
    this.sessionState.set(session);
  }

  clearSession(): void {
    this.sessionState.set(null);
  }
}
