import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';

interface MailtrapConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

export interface EmailConfig {
  provider: string;
  from: string;
  mailtrap: MailtrapConfig;
}

function getRequiredValue(configService: ConfigService, key: string): string {
  const value = configService.get<string>(key)?.trim();

  if (!value) {
    throw new Error(`Missing required email configuration: ${key}`);
  }

  return value;
}

export function getEmailConfig(configService: ConfigService): EmailConfig {
  return {
    provider:
      (configService.get<string>('EMAIL_PROVIDER') as string) ?? 'mailtrap',
    from: configService.get<string>('SMTP_FROM') ?? 'no-reply@example.com',
    mailtrap: {
      host: getRequiredValue(configService, 'SMTP_HOST'),
      port: Number(configService.get<string>('SMTP_PORT') ?? '2525'),
      secure: configService.get<string>('SMTP_SECURE') === 'true',
      user: getRequiredValue(configService, 'SMTP_USER'),
      pass: getRequiredValue(configService, 'SMTP_PASS'),
    },
  };
}

export function getMailerOptions(configService: ConfigService): MailerOptions {
  const emailConfig = getEmailConfig(configService);

  return {
    transport: {
      host: emailConfig.mailtrap.host,
      port: emailConfig.mailtrap.port,
      secure: emailConfig.mailtrap.secure,
      auth: {
        user: emailConfig.mailtrap.user,
        pass: emailConfig.mailtrap.pass,
      },
    },
    defaults: {
      from: emailConfig.from,
    },
  };
}
