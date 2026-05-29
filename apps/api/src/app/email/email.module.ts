import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { getEmailConfig, getMailerOptions } from './email.config';
import { EMAIL_PROVIDER } from './email-provider.interface';
import { EmailService } from './email.service';
import { MailtrapEmailProvider } from './providers/mailtrap-email.provider';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getMailerOptions(configService),
    }),
  ],
  providers: [
    EmailService,
    MailtrapEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService, MailtrapEmailProvider],
      useFactory: (
        configService: ConfigService,
        mailtrapEmailProvider: MailtrapEmailProvider,
      ) => {
        const emailConfig = getEmailConfig(configService);

        switch (emailConfig.provider) {
          case 'mailtrap':
            return mailtrapEmailProvider;
          default:
            //TODO  this should be a valid error with errorCode
            // It would be good to create an error to the email.errors file, and use it here
            throw new Error(
              `Unsupported email provider: ${emailConfig.provider}`,
            );
        }
      },
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
