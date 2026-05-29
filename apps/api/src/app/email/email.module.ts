import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { EMAIL_CONFIG, EmailConfig } from './email.constants';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [EMAIL_CONFIG],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
