import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SupportLang } from '@job-tracker-lite-angular/schemas';
import { EmailSendException } from './email.errors';
import { EMAIL_QUEUE, EmailJobName } from './email.queue';
import {
  EMAIL_PROVIDER,
  type EmailProvider,
  type SendEmailOptions,
} from './providers/email-provider.interface';
import {
  getDeleteAccountVerificationTemplate,
  getResetPasswordEmailTemplate,
  getEmailChangeConfirmationTemplate,
  getRestoreEmailTemplate,
  getVerificationEmailTemplate,
  getDeleteAccountNotificationTemplate,
} from './templates';

// BullMQ re-emits the Redis connection's 'error' event on the Queue itself.
// If nothing is listening for it, BullMQ's own fallback kicks in and dumps
// the raw error straight to the console on every reconnect attempt (ioredis
// retries indefinitely by default, so that's every second or two while
// Redis is down). Throttle how often we actually log it.
const QUEUE_ERROR_LOG_INTERVAL_MS = 30_000;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private lastQueueErrorLoggedAt = 0;

  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue<SendEmailOptions>,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
  ) {
    this.emailQueue.on('error', (error) => this.handleQueueError(error));
  }

  private handleQueueError(error: Error): void {
    const now = Date.now();
    if (now - this.lastQueueErrorLoggedAt < QUEUE_ERROR_LOG_INTERVAL_MS) {
      return;
    }
    this.lastQueueErrorLoggedAt = now;
    this.logger.warn(`Email queue Redis connection error: ${error.message}`);
  }

  async send(options: SendEmailOptions): Promise<void> {
    try {
      await this.emailQueue.add(EmailJobName.SEND, options, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        // Keep the last 100 completed jobs (or up to 24h old) around so
        // they're still visible in Bull Board for debugging, instead of
        // vanishing immediately on success.
        removeOnComplete: { count: 100, age: 24 * 60 * 60 },
        removeOnFail: false,
      });
      return;
    } catch (queueError) {
      // Enqueueing failed - most likely Redis is unreachable or misconfigured.
      // Log loudly so this doesn't go unnoticed (we don't want the fallback
      // to silently mask a Redis outage for days), then fall back to sending
      // directly through the provider so the user isn't blocked.
      this.logger.warn(
        `Failed to enqueue email to ${options.to}, falling back to direct send: ${
          queueError instanceof Error ? queueError.message : String(queueError)
        }`,
      );
    }

    try {
      await this.emailProvider.send(options);
    } catch (sendError) {
      throw new EmailSendException(sendError);
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
