import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from './email.queue';
import {
  EMAIL_PROVIDER,
  type EmailProvider,
  type SendEmailOptions,
} from './providers/email-provider.interface';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
  ) {
    super();
  }

  async process(job: Job<SendEmailOptions>): Promise<void> {
    try {
      await this.emailProvider.send(job.data);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${job.data.to} (job ${job.id}, attempt ${job.attemptsMade + 1})`,
        error instanceof Error ? error.stack : String(error),
      );
      // Rethrow the raw error so BullMQ marks the job as failed and applies
      // the retry/backoff policy configured when the job was added.
      throw error;
    }
  }
}
