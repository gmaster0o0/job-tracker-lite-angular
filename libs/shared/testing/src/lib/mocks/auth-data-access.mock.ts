import {
  AuthSessionDto,
  LoginDto,
  RegisterDto,
} from '@job-tracker-lite-angular/schemas';
import { validUserResponse } from '../fixtures/basic-login.fixture';

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
    getSession: async () => session,
    signIn: options.signIn ?? (async () => session),
    signUp: options.signUp ?? (async () => session),
    signOut: options.signOut ?? (async () => undefined),
  };
}
