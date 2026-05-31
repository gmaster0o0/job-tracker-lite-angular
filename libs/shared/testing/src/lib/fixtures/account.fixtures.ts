import {
  AccountSettingsDto,
  ChangeEmailRequestDto,
  ChangePasswordDto,
} from '@job-tracker-lite-angular/schemas';

export const accountSettingsFixtures: {
  default: AccountSettingsDto;
  withPendingEmail: AccountSettingsDto;
} = {
  default: {
    email: 'admin@example.com',
    pendingEmail: null,
    emailVerified: true,
  },
  withPendingEmail: {
    email: 'admin@example.com',
    pendingEmail: 'new-admin@example.com',
    emailVerified: true,
  },
};

export const changeEmailRequestFixtures: {
  valid: ChangeEmailRequestDto;
} = {
  valid: {
    newEmail: 'new-admin@example.com',
  },
};

export const changePasswordFixtures: {
  valid: ChangePasswordDto;
} = {
  valid: {
    currentPassword: 'Password123!',
    newPassword: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
  },
};

export const accountUserFixtures = {
  primary: {
    id: 'user_123',
    email: 'admin@example.com',
    pendingEmail: null,
    emailVerified: true,
  },
};

export const emailChangeTokenFixtures = {
  verify: {
    token: 'verify-token-123',
    userId: 'user_123',
    type: 'VERIFY',
    oldEmail: 'admin@example.com',
    newEmail: 'new-admin@example.com',
    expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  },
  restore: {
    token: 'restore-token-123',
    userId: 'user_123',
    type: 'RESTORE',
    oldEmail: 'admin@example.com',
    newEmail: 'new-admin@example.com',
    expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  },
};
