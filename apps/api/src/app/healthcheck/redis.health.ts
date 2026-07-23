import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { EMAIL_QUEUE } from '../email/email.queue';
import { describeRedisError } from '../queue/redis-error.util';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await Promise.race([this.ping(), this.connectionTimeout()]);
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: describeRedisError(error),
      });
    }
  }

  private async ping(): Promise<void> {
    const client = (await this.emailQueue.client) as unknown as Redis;
    await client.ping();
  }

  // Two ways a dead Redis can wedge this check, both bounded by the timeout:
  //  - ioredis retries a broken connection forever, so awaiting Queue.client
  //    never settles when Redis was never reachable.
  //  - if the connection was established and then dropped, `client.ping()` is
  //    parked in ioredis's offline command queue and never settles either.
  // Racing the whole ping against this timeout reports "down" instead of
  // hanging the request in either case.
  private connectionTimeout(): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timed out')), 2000),
    );
  }
}
