import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AuthDataAccessService,
  BackendError,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
} from '@job-tracker-lite-angular/schemas';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly authDataAccess = inject(AuthDataAccessService);

  private readonly sessionState =
    signal<Awaited<ReturnType<AuthDataAccessService['getSession']>>>(null);

  readonly isLoading = signal(false);
  readonly isInitialized = signal(false);
  readonly error = signal<string | null>(null);

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly user = computed(() => this.session()?.user ?? null);

  async loadSession(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const session = await this.authDataAccess.getSession();
      this.sessionState.set(session);
    } catch {
      this.sessionState.set(null);
      this.error.set('unknown');
    } finally {
      this.isLoading.set(false);
      this.isInitialized.set(true);
    }
  }

  async signIn(dto: LoginDto): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const session = await this.authDataAccess.signIn(dto);
      this.sessionState.set(session);
    } catch (error) {
      this.error.set(this.normalizeErrorCode(error));
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async signUp(dto: RegisterDto): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const session = await this.authDataAccess.signUp(dto);
      this.sessionState.set(session);
    } catch (error) {
      this.error.set(this.normalizeErrorCode(error));
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async signOut(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await this.authDataAccess.signOut();
      this.sessionState.set(null);
    } catch (error) {
      this.error.set(this.normalizeErrorCode(error));
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await this.authDataAccess.changePassword(dto);
    } catch (error) {
      this.error.set(this.normalizeErrorCode(error));
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  private normalizeErrorCode(error: unknown): string {
    return isBackendError(error)
      ? (error as BackendError).errorCode.toLowerCase()
      : 'unknown';
  }
}
