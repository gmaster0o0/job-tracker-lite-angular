import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { testSendOptions } from '@job-tracker-lite-angular/testing';
import { MailpitEmailProvider } from './mailpit-email.provider';

describe('MailpitEmailProvider', () => {
  let provider: MailpitEmailProvider;
  let mailerService: { sendMail: jest.Mock };

  beforeEach(async () => {
    mailerService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailpitEmailProvider,
        { provide: MailerService, useValue: mailerService },
      ],
    }).compile();

    provider = module.get<MailpitEmailProvider>(MailpitEmailProvider);
  });

  it('should delegate sending to the Mailpit SMTP transport', async () => {
    await provider.send(testSendOptions);

    expect(mailerService.sendMail).toHaveBeenCalledWith(testSendOptions);
  });

  it('should propagate errors from the SMTP transport', async () => {
    const smtpError = new Error('connect ECONNREFUSED 127.0.0.1:1025');
    mailerService.sendMail.mockRejectedValueOnce(smtpError);

    await expect(provider.send(testSendOptions)).rejects.toThrow(smtpError);
  });
});
