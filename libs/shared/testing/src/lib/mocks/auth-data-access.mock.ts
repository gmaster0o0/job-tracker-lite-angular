import {
  AuthSessionDto,
  LoginDto,
  RegisterDto,
} from '@job-tracker-lite-angular/schemas';
import { validUserResponse } from '../fixtures/basic-login.fixture';
import { vi } from 'vitest';

export type AuthDataAccessMockOptions = {
  session?: AuthSessionDto | null;
  signIn?: (dto: LoginDto) => Promise<AuthSessionDto>;
  signUp?: (dto: RegisterDto) => Promise<AuthSessionDto>;
  signOut?: () => Promise<void>;
};

export function createAuthDataAccessMock(
  options: AuthDataAccessMockOptions = {},
) {
  const session = options.session ?? validUserResponse;

  return {
    getSession: vi.fn(async () => session),
    signIn: vi.fn(options.signIn ?? (async () => session)),
    signUp: vi.fn(options.signUp ?? (async () => session)),
    signOut: vi.fn(options.signOut ?? (async () => undefined)),
  };
}
