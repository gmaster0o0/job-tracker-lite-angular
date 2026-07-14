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
} from '@job-tracker-lite-angular/schemas';
import { authSessionFixtures } from '../fixtures/auth.fixtures';
import { accountSettingsFixtures } from '../fixtures/account.fixtures';

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
  requestEmailChange?: (...args: any[]) => Promise<void>;
  changePassword?: (dto: ChangePasswordDto) => Promise<void>;
  verifyEmailChange?: (...args: any[]) => Promise<string | void>;
  restoreEmail?: (...args: any[]) => Promise<string | void>;
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
    changePassword: options.changePassword ?? (async () => undefined),
    verifyEmailChange: options.verifyEmailChange ?? (async () => undefined),
    restoreEmail: options.restoreEmail ?? (async () => undefined),
  };
}
