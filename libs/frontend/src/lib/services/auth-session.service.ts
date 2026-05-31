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

  private async waitForSessionResource(): Promise<void> {
    const maxAttempts = 25;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const hasValue = this.authDataAccess.session.hasValue();
      const hasError = this.authDataAccess.session.error() !== undefined;

      if (hasValue || hasError) {
        return;
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 10));
    }
  }

  async loadSession(): Promise<AuthSessionDto> {
    this.authDataAccess.session.reload();
    await this.waitForSessionResource();

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
