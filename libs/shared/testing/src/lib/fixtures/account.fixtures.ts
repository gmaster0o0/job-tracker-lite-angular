import {
  AccountDeletionStatusDto,
  AccountSettingsDto,
  ChangeEmailRequestDto,
  ChangePasswordDto,
  DeleteAccountDto,
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
    language: 'en',
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

export const deleteAccountRequestFixtures: {
  english: DeleteAccountDto;
} = {
  english: {
    language: 'en',
  },
};

export const accountUserFixtures = {
  primary: {
    id: 'user_123',
    email: 'admin@example.com',
    pendingEmail: null,
    emailVerified: true,
    status: 'ACTIVE',
  },
};

export const accountDeletionStatusFixtures: {
  active: AccountDeletionStatusDto;
  pending: AccountDeletionStatusDto;
} = {
  active: {
    status: 'active',
    gracePeriodRequestedAt: null,
    scheduledDeletionAt: null,
    gracePeriodDays: 7,
  },
  pending: {
    status: 'pending_deletion',
    gracePeriodRequestedAt: new Date('2099-01-01T00:00:00.000Z'),
    scheduledDeletionAt: new Date('2099-01-08T00:00:00.000Z'),
    gracePeriodDays: 7,
  },
};

export const accountDeletionStatusPrismaFixtures = {
  active: {
    status: 'ACTIVE',
    gracePeriodRequestedAt: null,
    scheduledDeletionAt: null,
    gracePeriodDays: 7,
  },
  pending: {
    status: 'PENDING_DELETION',
    gracePeriodRequestedAt: new Date('2099-01-01T00:00:00.000Z'),
    scheduledDeletionAt: new Date('2099-01-08T00:00:00.000Z'),
    gracePeriodDays: 7,
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

export const accountDeletionTokenFixtures = {
  valid: {
    token: 'delete-token-123',
    userId: accountUserFixtures.primary.id,
    expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  },
};

export const accountDeletionTimingFixtures = {
  requestAt: new Date('2026-01-01T10:00:00.000Z'),
  confirmAt: new Date('2026-01-01T10:15:00.000Z'),
  expectedTokenExpiresAt: new Date('2026-01-01T10:30:00.000Z'),
  expectedScheduledDeletionAt: new Date(2026, 0, 9, 0, 0, 0, 0),
};

export const accountRedirectFixtures = {
  emailChangeVerified:
    'http://localhost:4200/settings/account?emailChange=verified',
  emailRestoreRestored:
    'http://localhost:4200/auth/login?emailRestore=restored',
  accountDeletionConfirmed:
    'http://localhost:4200/auth/login?accountDeletion=confirmed',
};
