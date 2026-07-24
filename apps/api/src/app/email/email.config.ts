import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';

interface MailtrapConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

interface ResendConfig {
  apiKey: string;
}

interface MailpitConfig {
  host: string;
  port: number;
}

export interface EmailConfig {
  provider: string;
  from: string;
  mailtrap?: MailtrapConfig;
  resend?: ResendConfig;
  mailpit?: MailpitConfig;
}

function getRequiredValue(configService: ConfigService, key: string): string {
  const value = configService.get<string>(key)?.trim();

  if (!value) {
    throw new Error(`Missing required email configuration: ${key}`);
  }

  return value;
}

export function getEmailConfig(configService: ConfigService): EmailConfig {
  const provider =
    (configService.get<string>('EMAIL_PROVIDER') as string) ?? 'mailtrap';
  const from = configService.get<string>('SMTP_FROM') ?? 'no-reply@example.com';

  switch (provider) {
    case 'resend':
      return {
        provider,
        from,
        resend: {
          apiKey: getRequiredValue(configService, 'RESEND_API_KEY'),
        },
      };
    case 'mailpit':
      return {
        provider,
        from,
        mailpit: {
          host: configService.get<string>('MAILPIT_HOST') ?? 'localhost',
          port: Number(configService.get<string>('MAILPIT_PORT') ?? '1025'),
        },
      };
    case 'mailtrap':
      return {
        provider,
        from,
        mailtrap: {
          host: getRequiredValue(configService, 'SMTP_HOST'),
          port: Number(configService.get<string>('SMTP_PORT') ?? '2525'),
          secure: configService.get<string>('SMTP_SECURE') === 'true',
          user: getRequiredValue(configService, 'SMTP_USER'),
          pass: getRequiredValue(configService, 'SMTP_PASS'),
        },
      };
    default:
      // Let email-provider.factory.ts handle unrecognized provider validation.
      return { provider, from };
  }
}

export function getMailerOptions(configService: ConfigService): MailerOptions {
  const emailConfig = getEmailConfig(configService);

  if (emailConfig.mailpit) {
    return {
      transport: {
        host: emailConfig.mailpit.host,
        port: emailConfig.mailpit.port,
        secure: false,
      },
      defaults: {
        from: emailConfig.from,
      },
    };
  }

  if (emailConfig.mailtrap) {
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

  // Resend (or any future non-SMTP provider) doesn't go through
  // MailerService at all, but MailerModule.forRootAsync still needs a valid
  // transport - jsonTransport is nodemailer's built-in no-op transport that
  // never sends anything, so this stays inert.
  return {
    transport: { jsonTransport: true },
    defaults: {
      from: emailConfig.from,
    },
  };
}
