import { ConfigService } from '@nestjs/config';
import { getEmailConfig, getMailerOptions } from './email.config';

describe('email.config', () => {
  const buildConfigService = (
    values: Record<string, string | undefined>,
  ): ConfigService =>
    ({
      get: jest.fn((key: string) => values[key]),
    }) as unknown as ConfigService;

  describe('getEmailConfig', () => {
    it('should default to the mailtrap provider when EMAIL_PROVIDER is unset', () => {
      const configService = buildConfigService({
        SMTP_HOST: 'smtp.mailtrap.io',
        SMTP_USER: 'user',
        SMTP_PASS: 'pass',
      });

      const config = getEmailConfig(configService);

      expect(config.provider).toBe('mailtrap');
      expect(config.mailtrap).toEqual({
        host: 'smtp.mailtrap.io',
        port: 2525,
        secure: false,
        user: 'user',
        pass: 'pass',
      });
    });

    it('should throw when a required mailtrap value is missing', () => {
      const configService = buildConfigService({ EMAIL_PROVIDER: 'mailtrap' });

      expect(() => getEmailConfig(configService)).toThrow(
        'Missing required email configuration: SMTP_HOST',
      );
    });

    it('should build resend config without requiring SMTP values', () => {
      const configService = buildConfigService({
        EMAIL_PROVIDER: 'resend',
        RESEND_API_KEY: 'resend-key',
        SMTP_FROM: 'from@example.com',
      });

      const config = getEmailConfig(configService);

      expect(config).toEqual({
        provider: 'resend',
        from: 'from@example.com',
        resend: { apiKey: 'resend-key' },
      });
    });

    it('should throw when RESEND_API_KEY is missing for the resend provider', () => {
      const configService = buildConfigService({ EMAIL_PROVIDER: 'resend' });

      expect(() => getEmailConfig(configService)).toThrow(
        'Missing required email configuration: RESEND_API_KEY',
      );
    });

    it('should build mailpit config with sensible defaults', () => {
      const configService = buildConfigService({ EMAIL_PROVIDER: 'mailpit' });

      const config = getEmailConfig(configService);

      expect(config).toEqual({
        provider: 'mailpit',
        from: 'no-reply@example.com',
        mailpit: { host: 'localhost', port: 1025 },
      });
    });

    it('should honor custom mailpit host/port', () => {
      const configService = buildConfigService({
        EMAIL_PROVIDER: 'mailpit',
        MAILPIT_HOST: 'mailpit.local',
        MAILPIT_PORT: '2025',
      });

      const config = getEmailConfig(configService);

      expect(config.mailpit).toEqual({ host: 'mailpit.local', port: 2025 });
    });
  });

  describe('getMailerOptions', () => {
    it('should build an SMTP transport for mailtrap', () => {
      const configService = buildConfigService({
        EMAIL_PROVIDER: 'mailtrap',
        SMTP_HOST: 'smtp.mailtrap.io',
        SMTP_PORT: '2525',
        SMTP_USER: 'user',
        SMTP_PASS: 'pass',
        SMTP_FROM: 'from@example.com',
      });

      const options = getMailerOptions(configService);

      expect(options).toEqual({
        transport: {
          host: 'smtp.mailtrap.io',
          port: 2525,
          secure: false,
          auth: { user: 'user', pass: 'pass' },
        },
        defaults: { from: 'from@example.com' },
      });
    });

    it('should build an SMTP transport for mailpit without auth', () => {
      const configService = buildConfigService({
        EMAIL_PROVIDER: 'mailpit',
        SMTP_FROM: 'from@example.com',
      });

      const options = getMailerOptions(configService);

      expect(options).toEqual({
        transport: { host: 'localhost', port: 1025, secure: false },
        defaults: { from: 'from@example.com' },
      });
    });

    it('should fall back to a jsonTransport for non-SMTP providers like resend', () => {
      const configService = buildConfigService({
        EMAIL_PROVIDER: 'resend',
        RESEND_API_KEY: 'resend-key',
        SMTP_FROM: 'from@example.com',
      });

      const options = getMailerOptions(configService);

      expect(options).toEqual({
        transport: { jsonTransport: true },
        defaults: { from: 'from@example.com' },
      });
    });
  });
});
