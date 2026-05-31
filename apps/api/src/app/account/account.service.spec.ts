import { Test } from '@nestjs/testing';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { AccountService } from './account.service';
import {
  accountSettingsFixtures,
  accountUserFixtures,
  changeEmailRequestFixtures,
  createPrismaServiceMock,
  emailChangeTokenFixtures,
} from '@job-tracker-lite-angular/testing';
import { EmailChangeTokenType } from '@prisma/client';

describe('AccountService', () => {
  let service: AccountService;
  let prismaMock: ReturnType<typeof createPrismaServiceMock>;
  let emailServiceMock: {
    sendVerificationEmail: jest.Mock<
      Promise<void>,
      [string, string, 'en' | 'hu']
    >;
    sendEmailRestoreEmail: jest.Mock<
      Promise<void>,
      [string, string, 'en' | 'hu']
    >;
  };

  beforeEach(async () => {
    prismaMock = createPrismaServiceMock(jest.fn);
    prismaMock.$transaction.mockImplementation(async (cb: any) =>
      cb(prismaMock),
    );

    emailServiceMock = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendEmailRestoreEmail: jest.fn().mockResolvedValue(undefined),
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
            get: (key: string) => {
              if (key === 'FRONTEND_URL') {
                return 'http://localhost:4200';
              }
              if (key === 'BETTER_AUTH_URL') {
                return 'http://localhost:3000/api/auth';
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
    expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
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
});
