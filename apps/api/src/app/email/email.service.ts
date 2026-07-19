import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SupportLang } from '@job-tracker-lite-angular/schemas';
import { EmailSendException } from './email.errors';
import { EMAIL_QUEUE, EmailJobName } from './email.queue';
import { type SendEmailOptions } from './providers/email-provider.interface';
import {
  getDeleteAccountVerificationTemplate,
  getResetPasswordEmailTemplate,
  getEmailChangeConfirmationTemplate,
  getRestoreEmailTemplate,
  getVerificationEmailTemplate,
  getDeleteAccountNotificationTemplate,
} from './templates';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue<SendEmailOptions>,
  ) {}

  async send(options: SendEmailOptions): Promise<void> {
    try {
      await this.emailQueue.add(EmailJobName.SEND, options, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 10,
        removeOnFail: false,
      });
    } catch (error) {
      // This only fires if enqueueing itself fails (e.g. Redis unreachable).
      // Failures during the actual send happen later in EmailProcessor and
      // are handled by BullMQ's retry policy, not here.
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

  async sendDeleteAccountVerificationEmail(
    to: string,
    verificationUrl: string,
    lang: SupportLang = 'en',
    graceDays = 7,
  ): Promise<void> {
    const template = getDeleteAccountVerificationTemplate(
      verificationUrl,
      graceDays,
      lang,
    );

    await this.send({
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendDeleteAccountNotificationEmail(
    to: string,
    scheduledDeletionAt: Date,
    recoverUrl: string,
    lang: SupportLang = 'en',
  ): Promise<void> {
    const template = getDeleteAccountNotificationTemplate(
      scheduledDeletionAt,
      recoverUrl,
      lang,
    );

    await this.send({
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
}
