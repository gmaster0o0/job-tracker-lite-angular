import { HttpStatus } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { SupportLang } from '@job-tracker-lite-angular/schemas';
import { EMAIL_QUEUE, EmailJobName } from './email.queue';
import { EMAIL_ERROR_CODES } from './email.errors';
import { EmailService } from './email.service';
import {
  testRecipient,
  testResetUrl,
  testRestoreRecipient,
  testRestoreUrl,
  testVerificationRecipient,
  testVerificationUrl,
  testSendOptions,
} from '@job-tracker-lite-angular/testing';

describe('EmailService', () => {
  let service: EmailService;
  let emailQueue: { add: jest.Mock };

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken(EMAIL_QUEUE),
          useValue: emailQueue,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should enqueue send calls instead of sending directly', async () => {
    await service.send(testSendOptions);

    expect(emailQueue.add).toHaveBeenCalledWith(
      EmailJobName.SEND,
      testSendOptions,
      expect.objectContaining({ attempts: expect.any(Number) }),
    );
  });

  it.each<[SupportLang, string]>([
    ['en', 'Reset your password - Job Tracker Lite'],
    ['hu', 'Jelszó visszaállítása - Job Tracker Lite'],
  ])('should enqueue the reset password email in %s', async (lang, subject) => {
    await service.sendResetPasswordEmail(testRecipient, testResetUrl, lang);

    expect(emailQueue.add).toHaveBeenCalledWith(
      EmailJobName.SEND,
      expect.objectContaining({
        to: testRecipient,
        subject,
      }),
      expect.any(Object),
    );
  });

  it.each<[SupportLang, string]>([
    ['en', 'Verify your email - Job Tracker Lite'],
    ['hu', 'Email cím megerősítése - Job Tracker Lite'],
  ])('should enqueue the verification email in %s', async (lang, subject) => {
    await service.sendVerificationEmail(
      testVerificationRecipient,
      testVerificationUrl,
      lang,
    );

    expect(emailQueue.add).toHaveBeenCalledWith(
      EmailJobName.SEND,
      expect.objectContaining({
        to: testVerificationRecipient,
        subject,
      }),
      expect.any(Object),
    );
  });

  it.each<[SupportLang, string]>([
    ['en', 'Restore your previous email - Job Tracker Lite'],
    ['hu', 'Email visszaállítása - Job Tracker Lite'],
  ])('should enqueue the email restore email in %s', async (lang, subject) => {
    await service.sendEmailRestoreEmail(
      testRestoreRecipient,
      testRestoreUrl,
      lang,
    );

    expect(emailQueue.add).toHaveBeenCalledWith(
      EmailJobName.SEND,
      expect.objectContaining({
        to: testRestoreRecipient,
        subject,
      }),
      expect.any(Object),
    );
  });

  it('should include the restore URL in the enqueued email restore payload', async () => {
    await service.sendEmailRestoreEmail(
      testRestoreRecipient,
      testRestoreUrl,
      'en',
    );

    expect(emailQueue.add).toHaveBeenCalledWith(
      EmailJobName.SEND,
      expect.objectContaining({
        to: testRestoreRecipient,
        text: expect.stringContaining(testRestoreUrl),
        html: expect.stringContaining(testRestoreUrl),
      }),
      expect.any(Object),
    );
  });

  it.each<[SupportLang, string]>([
    ['en', 'Confirm your email change - Job Tracker Lite'],
    ['hu', 'Email-cím változtatás megerősítése - Job Tracker Lite'],
  ])(
    'should enqueue the email change confirmation email in %s',
    async (lang, subject) => {
      await service.sendEmailChangeConfirmationEmail(
        testVerificationRecipient,
        testVerificationUrl,
        lang,
      );

      expect(emailQueue.add).toHaveBeenCalledWith(
        EmailJobName.SEND,
        expect.objectContaining({
          to: testVerificationRecipient,
          subject,
        }),
        expect.any(Object),
      );
    },
  );

  it.each<[SupportLang, string]>([
    ['en', 'Confirm your account deletion - Job Tracker Lite'],
    ['hu', 'Fióktörlés megerősítése - Job Tracker Lite'],
  ])(
    'should enqueue the account deletion verification email in %s',
    async (lang, subject) => {
      await service.sendDeleteAccountVerificationEmail(
        testVerificationRecipient,
        testVerificationUrl,
        lang,
        7,
      );

      expect(emailQueue.add).toHaveBeenCalledWith(
        EmailJobName.SEND,
        expect.objectContaining({
          to: testVerificationRecipient,
          subject,
          text: expect.stringContaining(testVerificationUrl),
          html: expect.stringContaining(testVerificationUrl),
        }),
        expect.any(Object),
      );
    },
  );

  it.each<[SupportLang, string]>([
    ['en', 'Your account is scheduled for deletion - Job Tracker Lite'],
    ['hu', 'Fiókod törlése ütemezve lett - Job Tracker Lite'],
  ])(
    'should enqueue the account deletion notification email in %s',
    async (lang, subject) => {
      const scheduledDeletionAt = new Date('2024-01-01T00:00:00Z');
      const recoverUrl = 'https://example.com/recover';

      await service.sendDeleteAccountNotificationEmail(
        testVerificationRecipient,
        scheduledDeletionAt,
        recoverUrl,
        lang,
      );

      expect(emailQueue.add).toHaveBeenCalledWith(
        EmailJobName.SEND,
        expect.objectContaining({
          to: testVerificationRecipient,
          subject,
          text: expect.stringContaining(recoverUrl),
          html: expect.stringContaining(recoverUrl),
        }),
        expect.any(Object),
      );
    },
  );

  it('should wrap enqueue errors in a backend-style exception', async () => {
    emailQueue.add.mockRejectedValueOnce(new Error('redis unreachable'));

    await expect(service.send(testSendOptions)).rejects.toMatchObject({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      response: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to send email',
        errorCode: EMAIL_ERROR_CODES.SEND_FAILED,
      },
    });
  });
});
