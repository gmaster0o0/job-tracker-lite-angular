import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { getEmailConfig, getMailerOptions } from './email.config';
import { EMAIL_PROVIDER } from './providers/email-provider.interface';
import { UnsupportedEmailProviderException } from './email.errors';
import { EMAIL_QUEUE } from './email.queue';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { MailtrapEmailProvider } from './providers/mailtrap-email.provider';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getMailerOptions(configService),
    }),
    // The Redis connection (BullModule.forRootAsync) is configured once in
    // AppModule; here we only register this module's queue.
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: EMAIL_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    EmailService,
    EmailProcessor,
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
            throw new UnsupportedEmailProviderException(emailConfig.provider);
        }
      },
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
