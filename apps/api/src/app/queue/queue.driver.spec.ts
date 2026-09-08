import { getQueueDriver, isFakeQueueDriver } from './queue.driver';

describe('queue driver', () => {
  const originalDriver = process.env.QUEUE_DRIVER;

  afterEach(() => {
    if (originalDriver === undefined) {
      delete process.env.QUEUE_DRIVER;
    } else {
      process.env.QUEUE_DRIVER = originalDriver;
    }
  });

  describe('getQueueDriver', () => {
    it('should return inline when QUEUE_DRIVER=inline', () => {
      process.env.QUEUE_DRIVER = 'inline';

      expect(getQueueDriver()).toBe('inline');
    });

    it('should return memory when QUEUE_DRIVER=memory', () => {
      process.env.QUEUE_DRIVER = 'memory';

      expect(getQueueDriver()).toBe('memory');
    });

    it('should default to redis when QUEUE_DRIVER is unset', () => {
      delete process.env.QUEUE_DRIVER;

      expect(getQueueDriver()).toBe('redis');
    });

    it('should default to redis for an unrecognised value rather than faking the queue', () => {
      process.env.QUEUE_DRIVER = 'in-memory';

      expect(getQueueDriver()).toBe('redis');
    });

    it('should be case sensitive, so a mistyped value cannot disable Redis', () => {
      process.env.QUEUE_DRIVER = 'INLINE';

      expect(getQueueDriver()).toBe('redis');
    });
  });

  describe('isFakeQueueDriver', () => {
    it.each(['inline', 'memory'])('should be true for %s', (driver) => {
      process.env.QUEUE_DRIVER = driver;

      expect(isFakeQueueDriver()).toBe(true);
    });

    it('should be false when unset', () => {
      delete process.env.QUEUE_DRIVER;

      expect(isFakeQueueDriver()).toBe(false);
    });
  });
});
