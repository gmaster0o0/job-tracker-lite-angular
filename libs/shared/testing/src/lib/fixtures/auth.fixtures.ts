import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  AuthSessionDto,
} from '@job-tracker-lite-angular/schemas';

const timestamp = '2026-05-28T10:00:00.000Z';

export const authCredentialsFixtures: {
  validLogin: LoginDto;
  validRegister: RegisterDto;
  validChangePassword: ChangePasswordDto;
} = {
  validLogin: {
    email: 'auth.user@example.com',
    password: 'Passw0rd',
  },
  validRegister: {
    name: 'Auth User',
    email: 'auth.user@example.com',
    password: 'Passw0rd',
    confirmPassword: 'Passw0rd',
  },
  validChangePassword: {
    currentPassword: 'Passw0rd',
    newPassword: 'Newpass1',
    confirmNewPassword: 'Newpass1',
  },
};

export const authSessionFixtures: {
  authenticated: AuthSessionDto;
  guest: AuthSessionDto;
} = {
  authenticated: {
    user: {
      id: 'user_auth_1',
      name: 'Auth User',
      email: 'auth.user@example.com',
      emailVerified: true,
      image: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    session: {
      id: 'session_auth_1',
      token: 'token_auth_1',
      expiresAt: '2026-06-28T10:00:00.000Z',
      createdAt: timestamp,
      updatedAt: timestamp,
      ipAddress: '127.0.0.1',
      userAgent: 'Vitest',
      userId: 'user_auth_1',
    },
  },
  guest: null,
};
