/**
 * `inline` and `memory` are for API unit tests only. Neither exercises BullMQ
 * scheduling, retries, backoff or the worker, so e2e must run against Redis.
 */
export type QueueDriver = 'redis' | 'inline' | 'memory';

export function getQueueDriver(): QueueDriver {
  const raw = process.env.QUEUE_DRIVER;
  return raw === 'inline' || raw === 'memory' ? raw : 'redis';
}

export function isFakeQueueDriver(): boolean {
  return getQueueDriver() !== 'redis';
}
