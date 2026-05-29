import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SupportLang } from '@job-tracker-lite-angular/schemas';
import { EMAIL_PROVIDER, SendEmailOptions } from './email-provider.interface';
import { EMAIL_ERROR_CODES } from './email.errors';
import { EmailService } from './email.service';

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
    //TODO  use testing lib, and use centralized test data
    const options: SendEmailOptions = {
      to: 'john@example.com',
      subject: 'Test subject',
      text: 'Plain text body',
      html: '<p>Plain text body</p>',
    };

    await service.send(options);

    expect(emailProvider.send).toHaveBeenCalledWith(options);
  });
  //TODO  use testing lib, and use centralized test data
  it.each<[SupportLang, string]>([
    ['en', 'Reset your password - Job Tracker Lite'],
    ['hu', 'Jelszo visszaallitasa - Job Tracker Lite'],
  ])('should send the reset password email in %s', async (lang, subject) => {
    await service.sendResetPasswordEmail(
      'john@example.com',
      'http://localhost/reset?token=123',
      lang,
    );

    expect(emailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'john@example.com',
        subject,
      }),
    );
  });

  it('should wrap provider errors in a backend-style exception', async () => {
    emailProvider.send.mockRejectedValueOnce(new Error('smtp failed'));

    await expect(
      service.send({
        //TODO  use testing lib, and use centralized test data
        to: 'john@example.com',
        subject: 'Test subject',
        text: 'Plain text body',
        html: '<p>Plain text body</p>',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      response: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to send email',
        errorCode: EMAIL_ERROR_CODES.SEND_FAILED,
      },
    });
  });
});
