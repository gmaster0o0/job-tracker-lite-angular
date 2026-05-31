import {
  ForgotPasswordDto,
  AuthSessionDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SendVerificationEmailDto,
} from '@job-tracker-lite-angular/schemas';
import { authSessionFixtures } from '../fixtures/auth.fixtures';

export type AuthDataAccessMockOptions = {
  session?: AuthSessionDto | null;
  signIn?: (dto: LoginDto) => Promise<AuthSessionDto>;
  signUp?: (dto: RegisterDto) => Promise<AuthSessionDto>;
  signOut?: () => Promise<void>;
  requestPasswordReset?: (dto: ForgotPasswordDto) => Promise<void>;
  resetPassword?: (dto: ResetPasswordDto) => Promise<void>;
  sendVerificationEmail?: (dto: SendVerificationEmailDto) => Promise<void>;
};

export function createAuthDataAccessMock(
  options: AuthDataAccessMockOptions = {},
) {
  const session = options.session ?? authSessionFixtures.authenticated;

  return {
    getSession: async () => session,
    signIn: options.signIn ?? (async () => session),
    signUp: options.signUp ?? (async () => session),
    signOut: options.signOut ?? (async () => undefined),
    requestPasswordReset:
      options.requestPasswordReset ?? (async () => undefined),
    resetPassword: options.resetPassword ?? (async () => undefined),
    sendVerificationEmail:
      options.sendVerificationEmail ?? (async () => undefined),
  };
}
