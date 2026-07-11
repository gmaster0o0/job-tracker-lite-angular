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
  readonly isPendingDeletion = computed(
    () => this.sessionState()?.user.status === 'PENDING_DELETION',
  );

  async loadSession(): Promise<AuthSessionDto> {
    try {
      const session = await this.authDataAccess.getSession();
      this.sessionState.set(session);
      return session;
    } catch {
      this.sessionState.set(null);
      return null;
    }
  }

  setSession(session: AuthSessionDto): void {
    this.sessionState.set(session);
  }

  clearSession(): void {
    this.sessionState.set(null);
  }
}
