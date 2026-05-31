import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  type EmailProvider,
  type SendEmailOptions,
} from './email-provider.interface';

@Injectable()
export class MailtrapEmailProvider implements EmailProvider {
  constructor(private readonly mailerService: MailerService) {}

  async send(options: SendEmailOptions): Promise<void> {
    await this.mailerService.sendMail(options);
  }
}
