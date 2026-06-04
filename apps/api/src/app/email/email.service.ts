import { Inject, Injectable } from '@nestjs/common';
import { SupportLang } from '@job-tracker-lite-angular/schemas';
import { EmailSendException } from './email.errors';
import {
  EMAIL_PROVIDER,
  type EmailProvider,
  type SendEmailOptions,
} from './providers/email-provider.interface';
import {
  getResetPasswordEmailTemplate,
  getEmailChangeConfirmationTemplate,
  getRestoreEmailTemplate,
  getVerificationEmailTemplate,
} from './templates';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
  ) {}

  async send(options: SendEmailOptions): Promise<void> {
    try {
      await this.emailProvider.send(options);
    } catch (error) {
      throw new EmailSendException(error);
    }
  }

  async sendResetPasswordEmail(
    to: string,
    resetUrl: string,
    lang: SupportLang = 'en',
  ): Promise<void> {
    const template = getResetPasswordEmailTemplate(resetUrl, lang);

    await this.send({
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendVerificationEmail(
    to: string,
    verificationUrl: string,
    lang: SupportLang = 'en',
  ): Promise<void> {
    const template = getVerificationEmailTemplate(verificationUrl, lang);

    await this.send({
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendEmailRestoreEmail(
    to: string,
    restoreUrl: string,
    lang: SupportLang = 'en',
  ): Promise<void> {
    const template = getRestoreEmailTemplate(restoreUrl, lang);

    await this.send({
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendEmailChangeConfirmationEmail(
    to: string,
    confirmationUrl: string,
    lang: SupportLang = 'en',
  ): Promise<void> {
    const template = getEmailChangeConfirmationTemplate(confirmationUrl, lang);

    await this.send({
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
}
