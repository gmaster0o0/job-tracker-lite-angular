import {
  AccountSettingsDto,
  ChangeEmailRequestDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  AuthSessionDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SendVerificationEmailDto,
  SupportLang,
} from '@job-tracker-lite-angular/schemas';
import { authSessionFixtures } from '../fixtures/auth.fixtures';
import { accountSettingsFixtures } from '../fixtures/account.fixtures';

/**
 * requestEmailChange/cancelEmailChange are called two different ways depending
 * on which real service this mock stands in for: the frontend
 * AuthDataAccessService (a single DTO argument) or the backend AccountService
 * (userId + positional args, used via account.controller.spec.ts). The call
 * signature overloads below type both shapes instead of falling back to `any`.
 */
export type AuthDataAccessMockOptions = {
  session?: AuthSessionDto | null;
  accountSettings?: AccountSettingsDto;
  signIn?: (dto: LoginDto) => Promise<AuthSessionDto>;
  signUp?: (dto: RegisterDto) => Promise<AuthSessionDto>;
  signOut?: () => Promise<void>;
  requestPasswordReset?: (dto: ForgotPasswordDto) => Promise<void>;
  resetPassword?: (dto: ResetPasswordDto) => Promise<void>;
  sendVerificationEmail?: (dto: SendVerificationEmailDto) => Promise<void>;
  getAccountSettings?: () => Promise<AccountSettingsDto>;
  requestEmailChange?: {
    (dto: ChangeEmailRequestDto): Promise<void>;
    (userId: string, newEmail: string, language: SupportLang): Promise<void>;
  };
  cancelEmailChange?: {
    (): Promise<void>;
    (userId: string): Promise<void>;
  };
  changePassword?: (dto: ChangePasswordDto) => Promise<void>;
  verifyEmailChange?: (token: string, language: SupportLang) => Promise<string>;
  restoreEmail?: (token: string) => Promise<string>;
};

export function createAuthDataAccessMock(
  options: AuthDataAccessMockOptions = {},
) {
  const session = options.session ?? authSessionFixtures.authenticated;
  const accountSettings =
    options.accountSettings ?? accountSettingsFixtures.default;

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
    getAccountSettings:
      options.getAccountSettings ?? (async () => accountSettings),
    requestEmailChange: options.requestEmailChange ?? (async () => undefined),
    cancelEmailChange: options.cancelEmailChange ?? (async () => undefined),
    changePassword: options.changePassword ?? (async () => undefined),
    verifyEmailChange: options.verifyEmailChange ?? (async () => ''),
    restoreEmail: options.restoreEmail ?? (async () => ''),
  };
}
