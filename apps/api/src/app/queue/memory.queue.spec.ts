import { MemoryQueue } from './memory.queue';

interface Payload {
  to: string;
}

describe('MemoryQueue', () => {
  const noProcessor = () => undefined;

  describe('memory driver', () => {
    it('should record the job without running the processor', async () => {
      const process = jest.fn();
      const queue = new MemoryQueue<Payload>(
        'memory',
        () => ({ process }),
        'email',
      );

      await queue.add('send', { to: 'a@example.com' }, { attempts: 3 });

      expect(process).not.toHaveBeenCalled();
      expect(queue.jobs).toEqual([
        { name: 'send', data: { to: 'a@example.com' }, opts: { attempts: 3 } },
      ]);
    });

    it('should keep jobs in the order they were added', async () => {
      const queue = new MemoryQueue<Payload>('memory', noProcessor, 'email');

      await queue.add('first', { to: 'a@example.com' });
      await queue.add('second', { to: 'b@example.com' });

      expect(queue.jobs.map((job) => job.name)).toEqual(['first', 'second']);
    });

    it('should return a distinct id per job', async () => {
      const queue = new MemoryQueue<Payload>('memory', noProcessor, 'email');

      const first = await queue.add('send', { to: 'a@example.com' });
      const second = await queue.add('send', { to: 'b@example.com' });

      expect(first.id).not.toEqual(second.id);
    });

    it('should not require a processor', async () => {
      const queue = new MemoryQueue<Payload>('memory', noProcessor, 'email');

      await expect(
        queue.add('send', { to: 'a@example.com' }),
      ).resolves.toBeDefined();
    });
  });

  describe('inline driver', () => {
    it('should run the processor before resolving', async () => {
      const seen: string[] = [];
      const process = jest.fn(async () => {
        seen.push('processed');
      });
      const queue = new MemoryQueue<Payload>(
        'inline',
        () => ({ process }),
        'email',
      );

      await queue.add('send', { to: 'a@example.com' });
      seen.push('returned');

      expect(seen).toEqual(['processed', 'returned']);
    });

    it('should hand the processor a job shaped like a BullMQ one', async () => {
      const process = jest.fn();
      const queue = new MemoryQueue<Payload>(
        'inline',
        () => ({ process }),
        'email',
      );

      await queue.add('send', { to: 'a@example.com' });

      expect(process).toHaveBeenCalledWith({
        id: expect.any(String),
        name: 'send',
        data: { to: 'a@example.com' },
        attemptsMade: 0,
      });
    });

    it('should record the job as well as running it', async () => {
      const queue = new MemoryQueue<Payload>(
        'inline',
        () => ({ process: jest.fn() }),
        'email',
      );

      await queue.add('send', { to: 'a@example.com' });

      expect(queue.jobs).toHaveLength(1);
    });

    it('should name the queue when no processor is registered, rather than dropping the job', async () => {
      const queue = new MemoryQueue<Payload>('inline', noProcessor, 'email');

      await expect(queue.add('send', { to: 'a@example.com' })).rejects.toThrow(
        /no processor was registered for queue "email"/,
      );
    });

    it('should propagate a failure from the processor', async () => {
      const queue = new MemoryQueue<Payload>(
        'inline',
        () => ({
          process: jest.fn().mockRejectedValue(new Error('send failed')),
        }),
        'email',
      );

      await expect(queue.add('send', { to: 'a@example.com' })).rejects.toThrow(
        'send failed',
      );
    });

    it('should resolve the processor per call, not at construction', async () => {
      let resolutions = 0;
      const queue = new MemoryQueue<Payload>(
        'inline',
        () => {
          resolutions += 1;
          return { process: jest.fn() };
        },
        'email',
      );

      expect(resolutions).toBe(0);

      await queue.add('send', { to: 'a@example.com' });

      expect(resolutions).toBe(1);
    });
  });

  describe('queue surface used by callers', () => {
    it('should accept an error listener like the real Queue', () => {
      const queue = new MemoryQueue<Payload>('memory', noProcessor, 'email');
      const listener = jest.fn();

      queue.on('error', listener);
      queue.emit('error', new Error('redis down'));

      expect(listener).toHaveBeenCalledWith(new Error('redis down'));
    });

    it('should drop recorded jobs on clear', async () => {
      const queue = new MemoryQueue<Payload>('memory', noProcessor, 'email');
      await queue.add('send', { to: 'a@example.com' });

      queue.clear();

      expect(queue.jobs).toEqual([]);
    });

    it('should close without error', async () => {
      const queue = new MemoryQueue<Payload>('memory', noProcessor, 'email');

      await expect(queue.close()).resolves.toBeUndefined();
    });
  });
});
