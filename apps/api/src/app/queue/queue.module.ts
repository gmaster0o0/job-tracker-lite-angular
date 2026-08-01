import { EventEmitter } from 'events';
import { Module, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { QueueConfigFactory } from './queue.config.factory';

/**
 * How queued work is executed.
 *
 * - `redis`  - the real thing: BullMQ against Redis. Production, and every
 *              test lane that runs a backend (see ADR-0003: infrastructure we
 *              own runs for real).
 * - `inline` - runs the registered processor synchronously inside `add()`, so
 *              a unit test can assert the *effect* without Redis.
 * - `memory` - records jobs without running them, so a unit test can assert
 *              what was *enqueued*.
 *
 * `inline` and `memory` are for API unit tests only. They must not be set for
 * e2e: neither exercises BullMQ scheduling, retries, backoff or the worker.
 */
export type QueueDriver = 'redis' | 'inline' | 'memory';

export function getQueueDriver(): QueueDriver {
  const raw = process.env.QUEUE_DRIVER;
  return raw === 'inline' || raw === 'memory' ? raw : 'redis';
}

export function isFakeQueueDriver(): boolean {
  return getQueueDriver() !== 'redis';
}

export interface RecordedJob<T = unknown> {
  name: string;
  data: T;
  opts?: unknown;
}

interface ProcessorLike<T> {
  process(job: {
    id: string;
    name: string;
    data: T;
    attemptsMade: number;
  }): Promise<unknown>;
}

/**
 * Stand-in for a BullMQ Queue. Extends EventEmitter because callers attach an
 * 'error' listener to the real Queue.
 */
export class MemoryQueue<T = unknown> extends EventEmitter {
  /** Jobs handed to `add()`, in order. Assert against this under `memory`. */
  readonly jobs: RecordedJob<T>[] = [];
  private counter = 0;

  constructor(
    private readonly driver: QueueDriver,
    private readonly resolveProcessor: () => ProcessorLike<T> | undefined,
    private readonly queueName: string,
  ) {
    super();
  }

  async add(name: string, data: T, opts?: unknown) {
    const id = `${this.driver}-job-${++this.counter}`;
    this.jobs.push({ name, data, opts });

    if (this.driver === 'inline') {
      const processor = this.resolveProcessor();
      if (!processor) {
        throw new Error(
          `QUEUE_DRIVER=inline: no processor was registered for queue "${this.queueName}". ` +
            `Pass the processor class to QueueModule.registerQueue().`,
        );
      }
      await processor.process({ id, name, data, attemptsMade: 0 });
    }

    return { id, name, data };
  }

  /** Drop everything recorded so far - useful between unit tests. */
  clear(): void {
    this.jobs.length = 0;
  }

  async close(): Promise<void> {
    /* nothing to tear down */
  }
}

@Module({
  imports: [ConfigModule],
  providers: [QueueConfigFactory],
  exports: [QueueConfigFactory],
})
export class QueueModule {
  static forRoot() {
    if (isFakeQueueDriver()) {
      return {
        module: QueueModule,
      };
    }

    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const queueConfigFactory = new QueueConfigFactory(configService);

            return {
              connection: queueConfigFactory.getRedisConnection(),
            };
          },
        }),
      ],
      exports: [BullModule],
    };
  }

  /**
   * @param processor the `WorkerHost` handling this queue. Only needed for
   * `QUEUE_DRIVER=inline`, which calls it directly; resolved lazily so the
   * processor's own dependencies are constructed normally.
   */
  static registerQueue(name: string, processor?: Type<unknown>) {
    const driver = getQueueDriver();

    if (driver === 'redis') {
      return BullModule.registerQueue({ name });
    }

    const queueToken = getQueueToken(name);

    return {
      module: QueueModule,
      providers: [
        {
          provide: queueToken,
          inject: [ModuleRef],
          useFactory: (moduleRef: ModuleRef) =>
            new MemoryQueue(
              driver,
              () =>
                processor
                  ? (moduleRef.get(processor, {
                      strict: false,
                    }) as ProcessorLike<unknown>)
                  : undefined,
              name,
            ),
        },
      ],
      exports: [queueToken],
    };
  }
}
