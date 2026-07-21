import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from './email.queue';
import {
  EMAIL_PROVIDER,
  type EmailProvider,
  type SendEmailOptions,
} from './providers/email-provider.interface';
import { describeRedisError } from '../queue/redis-error.util';

// The Worker maintains its own Redis connection, separate from the Queue's
// (EmailService). Same reasoning as there: without a listener, BullMQ's
// fallback dumps the raw connection error to the console on every
// reconnect attempt, so throttle how often we actually log it.
const WORKER_ERROR_LOG_INTERVAL_MS = 30_000;

@Processor(EMAIL_QUEUE)
export class EmailProcessor
  extends WorkerHost
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(EmailProcessor.name);
  private lastWorkerErrorLoggedAt = 0;

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
  ) {
    super();
  }

  onApplicationBootstrap(): void {
    this.worker.on('error', (error) => this.handleWorkerError(error));
  }

  private handleWorkerError(error: Error): void {
    const now = Date.now();
    if (now - this.lastWorkerErrorLoggedAt < WORKER_ERROR_LOG_INTERVAL_MS) {
      return;
    }
    this.lastWorkerErrorLoggedAt = now;
    this.logger.warn(
      `Email worker Redis connection error: ${describeRedisError(error)}`,
    );
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
