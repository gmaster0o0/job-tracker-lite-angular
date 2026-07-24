import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { getEmailConfig } from '../email.config';
import { UnsupportedEmailProviderException } from '../email.errors';
import { EMAIL_PROVIDER, type EmailProvider } from './email-provider.interface';
import { MailtrapEmailProvider } from './mailtrap-email.provider';
import { ResendEmailProvider } from './resend-email.provider';
import { MailpitEmailProvider } from './mailpit-email.provider';

// Exported as a standalone provider definition (rather than inlined in
// EmailModule) so it can be unit tested without booting the full module -
// which would otherwise require a real Redis connection (BullModule) and
// SMTP transport (MailerModule).
export const emailProviderFactory: Provider = {
  provide: EMAIL_PROVIDER,
  inject: [ConfigService, ModuleRef],
  useFactory: async (
    configService: ConfigService,
    moduleRef: ModuleRef,
  ): Promise<EmailProvider> => {
    const emailConfig = getEmailConfig(configService);

    // Provider classes are deliberately not registered in EmailModule's
    // `providers` array - Nest eagerly constructs every registered provider
    // regardless of whether this switch actually picks it, which would mean
    // building a Resend client and an unused SMTP connection on every boot.
    // moduleRef.create() instead constructs only the one class selected
    // here, resolving its constructor deps from this module's injector.
    switch (emailConfig.provider) {
      case 'mailtrap':
        return moduleRef.create(MailtrapEmailProvider);
      case 'resend':
        return moduleRef.create(ResendEmailProvider);
      case 'mailpit':
        return moduleRef.create(MailpitEmailProvider);
      default:
        throw new UnsupportedEmailProviderException(emailConfig.provider);
    }
  },
};
