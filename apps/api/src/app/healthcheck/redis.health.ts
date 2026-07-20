import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { EMAIL_QUEUE } from '../email/email.queue';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const client = (await Promise.race([
        this.emailQueue.client,
        this.connectionTimeout(),
      ])) as unknown as Redis;
      await client.ping();
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ioredis retries a broken connection forever by default, so awaiting
  // Queue.client never settles while Redis is unreachable. Bound the wait
  // so the health check reports "down" instead of hanging the request.
  private connectionTimeout(): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timed out')), 2000),
    );
  }
}
