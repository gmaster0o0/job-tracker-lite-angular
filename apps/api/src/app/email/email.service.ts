import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SupportLang } from '@job-tracker-lite-angular/schemas';
import { resetPasswordEmailTemplates } from './reset-password-email.templates';

interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(options: SendMailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail({
        ...options,
      });
    } catch (error) {
      throw error
    }
  }

  async sendResetPasswordEmail(
    to: string,
    resetUrl: string,
    lang: SupportLang = 'en',
  ): Promise<void> {
    const template = resetPasswordEmailTemplates[lang];

    await this.mailerService.sendMail({
      to,
      subject: template.subject,
      text: template.text(resetUrl),
      html: template.html(resetUrl),
    });
  }
}
