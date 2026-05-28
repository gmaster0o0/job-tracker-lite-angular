import {
  AuthSessionDto,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
} from '@job-tracker-lite-angular/schemas';
import { authSessionFixtures } from '../fixtures/auth.fixtures';

export type AuthDataAccessMockOptions = {
  session?: AuthSessionDto;
};

export function createAuthDataAccessMock(
  options: AuthDataAccessMockOptions = {},
) {
  const signInCalls: LoginDto[] = [];
  const signUpCalls: RegisterDto[] = [];
  const changePasswordCalls: ChangePasswordDto[] = [];
  let activeSession =
    options.session === undefined
      ? authSessionFixtures.authenticated
      : options.session;

  return {
    getSession: async (): Promise<AuthSessionDto> => activeSession,
    signIn: async (dto: LoginDto): Promise<AuthSessionDto> => {
      signInCalls.push(dto);
      activeSession = authSessionFixtures.authenticated;
      return activeSession;
    },
    signUp: async (dto: RegisterDto): Promise<AuthSessionDto> => {
      signUpCalls.push(dto);
      activeSession = authSessionFixtures.authenticated;
      return activeSession;
    },
    signOut: async (): Promise<void> => {
      activeSession = null;
    },
    changePassword: async (dto: ChangePasswordDto): Promise<void> => {
      changePasswordCalls.push(dto);
    },
    __calls: {
      signInCalls,
      signUpCalls,
      changePasswordCalls,
    },
  };
}
