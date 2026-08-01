import { EventEmitter } from 'events';
import { QueueDriver } from './queue.driver';

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

/** Extends EventEmitter because callers attach an 'error' listener to the real Queue. */
export class MemoryQueue<T = unknown> extends EventEmitter {
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

  clear(): void {
    this.jobs.length = 0;
  }

  async close(): Promise<void> {
    /* nothing to tear down */
  }
}

export type { ProcessorLike };
