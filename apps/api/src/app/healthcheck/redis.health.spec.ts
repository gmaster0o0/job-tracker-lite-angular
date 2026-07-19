import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { getQueueToken } from '@nestjs/bullmq';
import { RedisHealthIndicator } from './redis.health';
import { EMAIL_QUEUE } from '../email/email.queue';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;
  let pingMock: jest.Mock;
  let upMock: jest.Mock;
  let downMock: jest.Mock;

  beforeEach(async () => {
    pingMock = jest.fn().mockResolvedValue('PONG');
    upMock = jest.fn(() => ({ status: 'up' }));
    downMock = jest.fn((data: Record<string, unknown>) => ({
      status: 'down',
      ...data,
    }));

    const healthIndicatorService = {
      check: jest.fn(() => ({ up: upMock, down: downMock })),
    };

    const emailQueue = {
      client: Promise.resolve({ ping: pingMock }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisHealthIndicator,
        {
          provide: HealthIndicatorService,
          useValue: healthIndicatorService,
        },
        {
          provide: getQueueToken(EMAIL_QUEUE),
          useValue: emailQueue,
        },
      ],
    }).compile();

    indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  it('should report up when the Redis ping succeeds', async () => {
    const result = await indicator.isHealthy('redis');

    expect(pingMock).toHaveBeenCalled();
    expect(upMock).toHaveBeenCalled();
    expect(result).toEqual({ status: 'up' });
  });

  it('should report down with the error message when the ping fails', async () => {
    pingMock.mockRejectedValueOnce(new Error('connection refused'));

    const result = await indicator.isHealthy('redis');

    expect(downMock).toHaveBeenCalledWith({ message: 'connection refused' });
    expect(result).toEqual({
      status: 'down',
      message: 'connection refused',
    });
  });
});
