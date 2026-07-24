import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { testSendOptions } from '@job-tracker-lite-angular/testing';
import { ResendEmailProvider } from './resend-email.provider';

const send = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send },
  })),
}));

describe('ResendEmailProvider', () => {
  let provider: ResendEmailProvider;
  let configService: { get: jest.Mock };

  const buildConfigService = (
    values: Record<string, string | undefined>,
  ): { get: jest.Mock } => ({
    get: jest.fn((key: string) => values[key]),
  });

  beforeEach(async () => {
    send.mockReset();
    configService = buildConfigService({
      EMAIL_PROVIDER: 'resend',
      RESEND_API_KEY: 'test-api-key',
      SMTP_FROM: 'no-reply@example.com',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendEmailProvider,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    provider = module.get<ResendEmailProvider>(ResendEmailProvider);
  });

  it('should send the email via the Resend API', async () => {
    send.mockResolvedValueOnce({ data: { id: 'email-1' }, error: null });

    await provider.send(testSendOptions);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'no-reply@example.com',
        to: testSendOptions.to,
        subject: testSendOptions.subject,
        html: testSendOptions.html,
        text: testSendOptions.text,
      }),
    );
  });

  it('should use the options.from override when provided', async () => {
    send.mockResolvedValueOnce({ data: { id: 'email-1' }, error: null });

    await provider.send({ ...testSendOptions, from: 'custom@example.com' });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'custom@example.com' }),
    );
  });

  it('should throw when the Resend API returns an error', async () => {
    send.mockResolvedValueOnce({
      data: null,
      error: { name: 'validation_error', message: 'Invalid `to` field' },
    });

    await expect(provider.send(testSendOptions)).rejects.toThrow(
      'Resend API error (validation_error): Invalid `to` field',
    );
  });

  it('should throw when RESEND_API_KEY is missing', async () => {
    configService.get.mockImplementation(
      (key: string) =>
        ({ EMAIL_PROVIDER: 'resend', SMTP_FROM: 'no-reply@example.com' })[key],
    );

    await expect(provider.send(testSendOptions)).rejects.toThrow(
      'Missing required email configuration: RESEND_API_KEY',
    );
  });
});
