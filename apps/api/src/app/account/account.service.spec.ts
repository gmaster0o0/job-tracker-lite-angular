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
        data: {
          pendingEmail: changeEmailRequestFixtures.valid.newEmail,
        },
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
    );
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
    it('deletes all job applications when the email matches', async () => {
      prismaMock.user.findUniqueOrThrow.mockResolvedValue({
        email: 'test@example.com',
      });
      prismaMock.job.deleteMany.mockResolvedValue({ count: 5 });

      await service.deleteJobApplications('user-id', 'test@example.com');

      expect(prismaMock.job.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
    });

    it('deletes all job applications when the email matches with different casing and whitespace', async () => {
      prismaMock.user.findUniqueOrThrow.mockResolvedValue({
        email: 'test@example.com',
      });
      prismaMock.job.deleteMany.mockResolvedValue({ count: 5 });

      await service.deleteJobApplications('user-id', '  TEST@example.com  ');

      expect(prismaMock.job.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
    });

    it('throws BadRequestException when the email does not match', async () => {
      prismaMock.user.findUniqueOrThrow.mockResolvedValue({
        email: 'test@example.com',
      });

      await expect(
        service.deleteJobApplications('user-id', 'wrong@example.com'),
      ).rejects.toThrow('Confirmation email does not match your account email');

      expect(prismaMock.job.deleteMany).not.toHaveBeenCalled();
    });
  });
});
