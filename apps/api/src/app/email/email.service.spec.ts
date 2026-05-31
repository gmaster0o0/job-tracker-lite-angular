import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SupportLang } from '@job-tracker-lite-angular/schemas';
import { EMAIL_PROVIDER, SendEmailOptions } from './email-provider.interface';
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
  let emailProvider: { send: jest.Mock<Promise<void>, [SendEmailOptions]> };

  beforeEach(async () => {
    emailProvider = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: EMAIL_PROVIDER,
          useValue: emailProvider,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should delegate send calls to the configured provider', async () => {
    await service.send(testSendOptions);

    expect(emailProvider.send).toHaveBeenCalledWith(testSendOptions);
  });

  it.each<[SupportLang, string]>([
    ['en', 'Reset your password - Job Tracker Lite'],
    ['hu', 'Jelszó visszaállítása - Job Tracker Lite'],
  ])('should send the reset password email in %s', async (lang, subject) => {
    await service.sendResetPasswordEmail(testRecipient, testResetUrl, lang);

    expect(emailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: testRecipient,
        subject,
      }),
    );
  });

  it.each<[SupportLang, string]>([
    ['en', 'Verify your email - Job Tracker Lite'],
    ['hu', 'Email cím megerősítése - Job Tracker Lite'],
  ])('should send the verification email in %s', async (lang, subject) => {
    await service.sendVerificationEmail(
      testVerificationRecipient,
      testVerificationUrl,
      lang,
    );

    expect(emailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: testVerificationRecipient,
        subject,
      }),
    );
  });

  it.each<[SupportLang, string]>([
    ['en', 'Restore your previous email - Job Tracker Lite'],
    ['hu', 'Email visszaállítása - Job Tracker Lite'],
  ])('should send the email restore email in %s', async (lang, subject) => {
    await service.sendEmailRestoreEmail(
      testRestoreRecipient,
      testRestoreUrl,
      lang,
    );

    expect(emailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: testRestoreRecipient,
        subject,
      }),
    );
  });

  it('should wrap provider errors in a backend-style exception', async () => {
    emailProvider.send.mockRejectedValueOnce(new Error('smtp failed'));

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
