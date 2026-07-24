import { Test } from '@nestjs/testing';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { AccountService } from './account.service';
import {
  accountDeletionTimingFixtures,
  accountDeletionTokenFixtures,
  accountDeletionStatusPrismaFixtures,
  accountRedirectFixtures,
  accountSettingsFixtures,
  accountUserFixtures,
  changeEmailRequestFixtures,
  createEmailServiceMock,
  createPrismaServiceMock,
  deleteAccountRequestFixtures,
  emailChangeTokenFixtures,
} from '@job-tracker-lite-angular/testing';
import { EmailChangeTokenType } from '@prisma/client';

describe('AccountService', () => {
  let service: AccountService;
  let prismaMock: ReturnType<typeof createPrismaServiceMock>;
  let emailServiceMock: ReturnType<typeof createEmailServiceMock>;
  let configValues: Record<string, unknown>;

  beforeEach(async () => {
    prismaMock = createPrismaServiceMock(jest.fn);
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback(prismaMock),
    );

    emailServiceMock = createEmailServiceMock((fn) => jest.fn(fn));
    configValues = {
      FRONTEND_URL: 'http://localhost:4200',
      BETTER_AUTH_URL: 'http://localhost:3000/api/auth',
      ACCOUNT_DELETION_GRACE_PERIOD_DAYS: 10, //different from default to test config override
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => configValues[key],
          },
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get(AccountService);
  });

  it('returns account settings for user', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(
      accountSettingsFixtures.default,
    );

    await expect(
      service.getAccountSettings(accountUserFixtures.primary.id),
    ).resolves.toEqual(accountSettingsFixtures.default);
  });

  it('creates verify token and sends verification email when requesting email change', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(
      accountUserFixtures.primary,
    );
    prismaMock.user.findFirst.mockResolvedValue(null);

    await service.requestEmailChange(
      accountUserFixtures.primary.id,
      changeEmailRequestFixtures.valid.newEmail,
      changeEmailRequestFixtures.valid.language,
    );

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pendingEmail: changeEmailRequestFixtures.valid.newEmail,
          lastEmailChangeRequestedAt: expect.any(Date),
        }),
      }),
    );
    expect(prismaMock.emailChangeToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: accountUserFixtures.primary.id,
          type: EmailChangeTokenType.VERIFY,
          oldEmail: accountUserFixtures.primary.email,
          newEmail: changeEmailRequestFixtures.valid.newEmail,
          token: expect.any(String),
        }),
      }),
    );
    expect(
      emailServiceMock.sendEmailChangeConfirmationEmail,
    ).toHaveBeenCalledWith(
      changeEmailRequestFixtures.valid.newEmail,
      expect.stringMatching(
        /\/account\/verify-email-change\?token=.*&language=en/,
      ),
      'en',
      24,
    );
  });

  it('rejects a request before the cooldown elapses', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      ...accountUserFixtures.primary,
      lastEmailChangeRequestedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    prismaMock.user.findFirst.mockResolvedValue(null);

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:30.000Z')); // 30s later, cooldown is 60s

    try {
      await expect(
        service.requestEmailChange(
          accountUserFixtures.primary.id,
          changeEmailRequestFixtures.valid.newEmail,
          changeEmailRequestFixtures.valid.language,
        ),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          errorCode: 'resend_cooldown_active',
        }),
      });

      expect(prismaMock.emailChangeToken.create).not.toHaveBeenCalled();
      expect(
        emailServiceMock.sendEmailChangeConfirmationEmail,
      ).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('allows a request once the cooldown elapses', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      ...accountUserFixtures.primary,
      lastEmailChangeRequestedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    prismaMock.user.findFirst.mockResolvedValue(null);

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:01:01.000Z')); // 61s later, past the 60s cooldown

    try {
      await service.requestEmailChange(
        accountUserFixtures.primary.id,
        changeEmailRequestFixtures.valid.newEmail,
        changeEmailRequestFixtures.valid.language,
      );

      expect(prismaMock.emailChangeToken.create).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('rejects an immediate request for a different target email during the cooldown', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      ...accountUserFixtures.primary,
      lastEmailChangeRequestedAt: new Date(),
    });
    prismaMock.user.findFirst.mockResolvedValue(null);

    await expect(
      service.requestEmailChange(
        accountUserFixtures.primary.id,
        'a-totally-different-address@example.com',
        changeEmailRequestFixtures.valid.language,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: 'resend_cooldown_active',
      }),
    });

    expect(prismaMock.emailChangeToken.create).not.toHaveBeenCalled();
  });

  it('rejects an immediate re-request after cancelling within the cooldown window', async () => {
    // cancelEmailChange must not reset lastEmailChangeRequestedAt, so a
    // request -> cancel -> request loop can't bypass the cooldown.
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      ...accountUserFixtures.primary,
      lastEmailChangeRequestedAt: new Date(),
    });
    prismaMock.user.findFirst.mockResolvedValue(null);

    await service.cancelEmailChange(accountUserFixtures.primary.id);

    await expect(
      service.requestEmailChange(
        accountUserFixtures.primary.id,
        'yet-another-address@example.com',
        changeEmailRequestFixtures.valid.language,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: 'resend_cooldown_active',
      }),
    });

    expect(prismaMock.emailChangeToken.create).not.toHaveBeenCalled();
  });

  it('returns pending email requested/expires timestamps from the active verify token', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      ...accountSettingsFixtures.withPendingEmail,
      lastEmailChangeRequestedAt: null,
    });
    prismaMock.emailChangeToken.findFirst.mockResolvedValue({
      createdAt: emailChangeTokenFixtures.verify.createdAt,
      expiresAt: emailChangeTokenFixtures.verify.expiresAt,
    });

    await expect(
      service.getAccountSettings(accountUserFixtures.primary.id),
    ).resolves.toEqual({
      email: accountSettingsFixtures.withPendingEmail.email,
      pendingEmail: accountSettingsFixtures.withPendingEmail.pendingEmail,
      emailVerified: accountSettingsFixtures.withPendingEmail.emailVerified,
      pendingEmailRequestedAt: emailChangeTokenFixtures.verify.createdAt,
      pendingEmailExpiresAt: emailChangeTokenFixtures.verify.expiresAt,
      emailChangeResendAvailableAt: null,
    });
    expect(prismaMock.emailChangeToken.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: accountUserFixtures.primary.id,
          type: EmailChangeTokenType.VERIFY,
        },
      }),
    );
  });

  it('returns emailChangeResendAvailableAt from lastEmailChangeRequestedAt even without a pending email', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      ...accountSettingsFixtures.default,
      lastEmailChangeRequestedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(
      service.getAccountSettings(accountUserFixtures.primary.id),
    ).resolves.toEqual({
      ...accountSettingsFixtures.default,
      emailChangeResendAvailableAt: new Date('2026-01-01T00:01:00.000Z'),
    });
    expect(prismaMock.emailChangeToken.findFirst).not.toHaveBeenCalled();
  });

  it('cancels a pending email change by clearing pendingEmail and deleting the verify token', async () => {
    await service.cancelEmailChange(accountUserFixtures.primary.id);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: accountUserFixtures.primary.id },
      data: { pendingEmail: null },
    });
    expect(prismaMock.emailChangeToken.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: accountUserFixtures.primary.id,
        type: EmailChangeTokenType.VERIFY,
      },
    });
  });

  it('verifies pending email change and sends restore email', async () => {
    prismaMock.emailChangeToken.findUnique.mockResolvedValue({
      ...emailChangeTokenFixtures.verify,
      type: EmailChangeTokenType.VERIFY,
    });
    prismaMock.user.findFirst.mockResolvedValue(null);

    const redirectUrl = await service.verifyEmailChange(
      emailChangeTokenFixtures.verify.token,
      changeEmailRequestFixtures.valid.language,
    );

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: emailChangeTokenFixtures.verify.newEmail,
          pendingEmail: null,
          emailVerified: true,
        }),
      }),
    );
    expect(emailServiceMock.sendEmailRestoreEmail).toHaveBeenCalledWith(
      emailChangeTokenFixtures.verify.oldEmail,
      expect.stringMatching(/\/account\/restore-email\?token=.*&language=en/),
      'en',
      7,
    );
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: emailChangeTokenFixtures.verify.userId,
      },
    });
    expect(redirectUrl).toContain('/settings/account?emailChange=verified');
    expect(redirectUrl).toContain('language=en');
  });

  it('restores old email and clears all sessions', async () => {
    prismaMock.emailChangeToken.findUnique.mockResolvedValue({
      ...emailChangeTokenFixtures.restore,
      type: EmailChangeTokenType.RESTORE,
    });
    prismaMock.user.findFirst.mockResolvedValue(null);

    const redirectUrl = await service.restoreEmail(
      emailChangeTokenFixtures.restore.token,
    );

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: emailChangeTokenFixtures.restore.userId,
      },
    });
    expect(prismaMock.emailChangeToken.delete).toHaveBeenCalledWith({
      where: { token: emailChangeTokenFixtures.restore.token },
    });
    expect(redirectUrl).toContain('/auth/login?emailRestore=restored');
  });

  it('creates account deletion token and sends verification email', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(
      accountUserFixtures.primary,
    );

    await service.requestAccountDeletion(
      accountUserFixtures.primary.id,
      deleteAccountRequestFixtures.english.language,
    );

    expect(prismaMock.accountDeletionToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: accountUserFixtures.primary.id },
    });
    expect(prismaMock.accountDeletionToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: accountUserFixtures.primary.id,
          token: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      }),
    );
    expect(
      emailServiceMock.sendDeleteAccountVerificationEmail,
    ).toHaveBeenCalledWith(
      accountUserFixtures.primary.email,
      expect.stringMatching(/\/account\/confirm-delete\?token=.*&language=en/),
      deleteAccountRequestFixtures.english.language,
      10, // grace period days from config override
    );
  });

  it('uses a 30 minute default expiration for deletion confirmation tokens', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(
      accountUserFixtures.primary,
    );

    jest.useFakeTimers();
    jest.setSystemTime(accountDeletionTimingFixtures.requestAt);

    try {
      await service.requestAccountDeletion(
        accountUserFixtures.primary.id,
        deleteAccountRequestFixtures.english.language,
      );

      const createCall =
        prismaMock.accountDeletionToken.create.mock.calls[0]?.[0];
      const expiresAt = createCall?.data?.expiresAt as Date;

      expect(expiresAt).toEqual(
        accountDeletionTimingFixtures.expectedTokenExpiresAt,
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('confirms account deletion, sends notification, and returns pending redirect', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(accountDeletionTimingFixtures.confirmAt);

    prismaMock.accountDeletionToken.findUnique.mockResolvedValue(
      accountDeletionTokenFixtures.valid,
    );
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(
      accountUserFixtures.primary,
    );

    try {
      const redirect = await service.confirmAccountDeletion(
        accountDeletionTokenFixtures.valid.token,
        deleteAccountRequestFixtures.english.language,
      );

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: accountUserFixtures.primary.id },
          data: expect.objectContaining({
            status: 'PENDING_DELETION',
            gracePeriodDays: 10, // from config override
            scheduledDeletionAt:
              accountDeletionTimingFixtures.expectedScheduledDeletionAfter10Days,
          }),
        }),
      );
      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: accountUserFixtures.primary.id,
        },
      });

      expect(
        emailServiceMock.sendDeleteAccountNotificationEmail,
      ).toHaveBeenCalledWith(
        accountUserFixtures.primary.email,
        accountDeletionTimingFixtures.expectedScheduledDeletionAfter10Days,
        'http://localhost:4200/privacy/delete-pending?language=en',
        deleteAccountRequestFixtures.english.language,
      );

      expect(redirect).toContain(
        accountRedirectFixtures.accountDeletionConfirmed,
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('returns account deletion status for user', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(
      accountDeletionStatusPrismaFixtures.pending,
    );

    await expect(
      service.getAccountDeletionStatus(accountUserFixtures.primary.id),
    ).resolves.toMatchObject({
      status: 'pending_deletion',
      gracePeriodDays: 7,
    });
  });

  it('recovers account by resetting pending deletion fields', async () => {
    await service.recoverAccountDeletion(accountUserFixtures.primary.id);

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: accountUserFixtures.primary.id },
        data: expect.objectContaining({
          status: 'ACTIVE',
          gracePeriodRequestedAt: null,
          scheduledDeletionAt: null,
        }),
      }),
    );
    expect(prismaMock.accountDeletionToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: accountUserFixtures.primary.id },
    });
  });

  it('hard deletes accounts that passed grace period', async () => {
    prismaMock.user.deleteMany.mockResolvedValue({ count: 2 });

    await expect(service.executeScheduledDeletion()).resolves.toBe(2);
    expect(prismaMock.user.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING_DELETION',
        }),
      }),
    );
  });

  describe('exportUserData', () => {
    it('returns the user with profile and jobs (including notes and contacts)', async () => {
      const exportDataMock = { id: 'user-id', profile: {}, jobs: [] };
      prismaMock.user.findUniqueOrThrow.mockResolvedValue(exportDataMock);

      const result = await service.exportUserData('user-id');

      expect(result).toEqual(exportDataMock);
      expect(prismaMock.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        include: {
          profile: true,
          jobs: {
            include: {
              notes: true,
              contacts: true,
            },
          },
        },
      });
    });
  });

  describe('deleteJobApplications', () => {
    const fixedDate = new Date('2026-05-12T12:12:12.304Z');
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });
    it('delete jobs before the cutoff date', async () => {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 1);

      prismaMock.user.findUniqueOrThrow.mockResolvedValue({
        email: 'test@example.com',
      });
      prismaMock.job.deleteMany.mockResolvedValue({ count: 5 });
      const data = {
        email: 'test@example.com',
        cutoffDate,
      };
      await service.deleteJobApplications('user-id', data);

      expect(prismaMock.job.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          updatedAt: { lte: cutoffDate },
        },
      });
    });

    it('deletes job applications when the email matches with different casing and whitespace', async () => {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      prismaMock.user.findUniqueOrThrow.mockResolvedValue({
        email: 'test@example.com',
      });
      prismaMock.job.deleteMany.mockResolvedValue({ count: 5 });
      const data = {
        email: '  TEST@example.com  ',
        cutoffDate,
      };
      await service.deleteJobApplications('user-id', data);

      expect(prismaMock.job.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id', updatedAt: { lte: cutoffDate } },
      });
    });

    it('throws BadRequestException when the email does not match', async () => {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      prismaMock.user.findUniqueOrThrow.mockResolvedValue({
        email: 'test@example.com',
      });
      const data = {
        email: 'wrong@example.com  ',
        cutoffDate,
      };
      await expect(
        service.deleteJobApplications('user-id', data),
      ).rejects.toThrow('Confirmation email does not match your account email');

      expect(prismaMock.job.deleteMany).not.toHaveBeenCalled();
    });
  });
});
