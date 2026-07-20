import { ConfigService } from '@nestjs/config';
import { QueueConfigFactory } from './queue.config.factory';

describe('QueueConfigFactory', () => {
  let configService: { get: jest.Mock };
  let factory: QueueConfigFactory;

  beforeEach(() => {
    configService = { get: jest.fn() };
    factory = new QueueConfigFactory(configService as unknown as ConfigService);
  });

  describe('getRedisConnection', () => {
    it('should fall back to default host/port when nothing is configured', () => {
      configService.get.mockReturnValue(undefined);

      expect(factory.getRedisConnection()).toEqual({
        host: 'localhost',
        port: 6379,
        password: undefined,
      });
    });

    it('should use explicit host/port/password when REDIS_URL is not set', () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'REDIS_HOST':
            return 'redis.example.com';
          case 'REDIS_PORT':
            return 6380;
          case 'REDIS_PASSWORD':
            return 'secret';
          default:
            return undefined;
        }
      });

      expect(factory.getRedisConnection()).toEqual({
        host: 'redis.example.com',
        port: 6380,
        password: 'secret',
      });
    });

    it('should parse REDIS_URL and enable TLS for rediss:// (e.g. Upstash)', () => {
      configService.get.mockImplementation((key: string) =>
        key === 'REDIS_URL'
          ? 'rediss://default:mytoken@my-instance.upstash.io:6379'
          : undefined,
      );

      expect(factory.getRedisConnection()).toEqual({
        host: 'my-instance.upstash.io',
        port: 6379,
        username: 'default',
        password: 'mytoken',
        tls: {},
      });
    });

    it('should parse REDIS_URL without TLS for plain redis://', () => {
      configService.get.mockImplementation((key: string) =>
        key === 'REDIS_URL'
          ? 'redis://default:mytoken@localhost:6379'
          : undefined,
      );

      expect(factory.getRedisConnection()).toEqual({
        host: 'localhost',
        port: 6379,
        username: 'default',
        password: 'mytoken',
        tls: undefined,
      });
    });
  });

  describe('getDashboardRoute', () => {
    it('should return the default route when not configured', () => {
      configService.get.mockReturnValue(undefined);

      expect(factory.getDashboardRoute()).toBe('/admin/queues');
    });

    it('should return the configured route when set', () => {
      configService.get.mockImplementation((key: string) =>
        key === 'QUEUE_DASHBOARD_ROUTE' ? '/internal/queues' : undefined,
      );

      expect(factory.getDashboardRoute()).toBe('/internal/queues');
    });
  });

  describe('isDashboardEnabled', () => {
    it('should be false when not configured', () => {
      configService.get.mockReturnValue(undefined);

      expect(factory.isDashboardEnabled()).toBe(false);
    });

    it("should be true only when the value is exactly 'true'", () => {
      configService.get.mockReturnValue('true');

      expect(factory.isDashboardEnabled()).toBe(true);
    });

    it('should be false for any other value', () => {
      configService.get.mockReturnValue('yes');

      expect(factory.isDashboardEnabled()).toBe(false);
    });
  });

  describe('getDashboardCredentials', () => {
    it('should throw when the username or password is missing', () => {
      configService.get.mockReturnValue(undefined);

      expect(() => factory.getDashboardCredentials()).toThrow(
        /QUEUE_DASHBOARD_USER and QUEUE_DASHBOARD_PASSWORD/,
      );
    });

    it('should return the credentials when both are set', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'QUEUE_DASHBOARD_USER') return 'admin';
        if (key === 'QUEUE_DASHBOARD_PASSWORD') return 'secret';
        return undefined;
      });

      expect(factory.getDashboardCredentials()).toEqual({
        username: 'admin',
        password: 'secret',
      });
    });
  });
});
