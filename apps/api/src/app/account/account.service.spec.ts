import { Test } from '@nestjs/testing';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { AccountService } from './account.service';
import {
  accountDeletionStatusFixtures,
  accountSettingsFixtures,
  accountUserFixtures,
  changeEmailRequestFixtures,
  createEmailServiceMock,
  createPrismaServiceMock,
  emailChangeTokenFixtures,
} from '@job-tracker-lite-angular/testing';
import { EmailChangeTokenType } from '@prisma/client';

describe('AccountService', () => {
  let service: AccountService;
  let prismaMock: ReturnType<typeof createPrismaServiceMock>;
  let emailServiceMock: ReturnType<typeof createEmailServiceMock>;

  beforeEach(async () => {
    prismaMock = createPrismaServiceMock(jest.fn);
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback(prismaMock),
    );

    emailServiceMock = createEmailServiceMock((fn) => jest.fn(fn));

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
            get: (key: string) => {
              if (key === 'FRONTEND_URL') {
                return 'http://localhost:4200';
              }
              if (key === 'BETTER_AUTH_URL') {
                return 'http://localhost:3000/api/auth';
              }
              if (key === 'ACCOUNT_DELETION_GRACE_PERIOD_DAYS') {
                return 7;
              }
              return undefined;
            },
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
      expect.stringContaining('/account/verify-email-change?token='),
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
      expect.stringContaining('/account/restore-email?token='),
      'en',
    );
    expect(redirectUrl).toContain('/settings/account?emailChange=verified');
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

    await service.requestAccountDeletion(accountUserFixtures.primary.id, 'en');

    expect(prismaMock.accountDeletionToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: accountUserFixtures.primary.id },
    });
    expect(prismaMock.accountDeletionToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: accountUserFixtures.primary.id,
          token: expect.any(String),
        }),
      }),
    );
    expect(
      emailServiceMock.sendDeleteAccountVerificationEmail,
    ).toHaveBeenCalledWith(
      accountUserFixtures.primary.email,
      expect.stringContaining('/account/confirm-delete?token='),
      'en',
      7,
    );
  });

  it('confirms account deletion and returns pending redirect', async () => {
    prismaMock.accountDeletionToken.findUnique.mockResolvedValue({
      token: 'delete-token-123',
      userId: accountUserFixtures.primary.id,
      expiresAt: new Date('2099-01-01T00:00:00.000Z'),
    });

    const redirect = await service.confirmAccountDeletion('delete-token-123');

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: accountUserFixtures.primary.id },
        data: expect.objectContaining({
          status: 'PENDING_DELETION',
          gracePeriodDays: 7,
        }),
      }),
    );
    expect(redirect).toContain('/settings/privacy/delete-pending');
  });

  it('returns account deletion status for user', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(
      accountDeletionStatusFixtures.pending,
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
});
