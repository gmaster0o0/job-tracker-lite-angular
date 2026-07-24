import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { EMAIL_PROVIDER } from './email-provider.interface';
import { emailProviderFactory } from './email-provider.factory';
import { MailtrapEmailProvider } from './mailtrap-email.provider';
import { ResendEmailProvider } from './resend-email.provider';
import { MailpitEmailProvider } from './mailpit-email.provider';

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: jest.fn() } })),
}));

describe('emailProviderFactory', () => {
  // Deliberately does NOT register MailtrapEmailProvider/ResendEmailProvider/
  // MailpitEmailProvider as providers - moduleRef.create() must be able to
  // construct them on demand, exactly as it will in the real EmailModule,
  // resolving their constructor deps (MailerService, ConfigService) from
  // this module's injector.
  const buildModule = (
    values: Record<string, string | undefined>,
  ): Promise<TestingModule> =>
    Test.createTestingModule({
      providers: [
        emailProviderFactory,
        {
          provide: ConfigService,
          useValue: { get: (key: string) => values[key] },
        },
        { provide: MailerService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();

  it('should resolve MailtrapEmailProvider for the mailtrap provider', async () => {
    const module = await buildModule({
      EMAIL_PROVIDER: 'mailtrap',
      SMTP_HOST: 'smtp.mailtrap.io',
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
    });

    expect(module.get(EMAIL_PROVIDER)).toBeInstanceOf(MailtrapEmailProvider);
  });

  it('should resolve ResendEmailProvider for the resend provider', async () => {
    const module = await buildModule({
      EMAIL_PROVIDER: 'resend',
      RESEND_API_KEY: 'resend-key',
    });

    expect(module.get(EMAIL_PROVIDER)).toBeInstanceOf(ResendEmailProvider);
  });

  it('should resolve MailpitEmailProvider for the mailpit provider', async () => {
    const module = await buildModule({ EMAIL_PROVIDER: 'mailpit' });

    expect(module.get(EMAIL_PROVIDER)).toBeInstanceOf(MailpitEmailProvider);
  });

  it('should reject unsupported providers', async () => {
    await expect(buildModule({ EMAIL_PROVIDER: 'sendgrid' })).rejects.toThrow(
      'Unsupported email provider: sendgrid',
    );
  });
});
