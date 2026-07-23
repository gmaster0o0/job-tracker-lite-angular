import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { HealthService } from './healthcheck.service';
import { UptimeHealthIndicator } from './uptime.health';
import { RedisHealthIndicator } from './redis.health';

describe('HealthService', () => {
  let service: HealthService;
  let dbPingCheck: jest.Mock;
  let uptimeIsHealthy: jest.Mock;
  let redisIsHealthy: jest.Mock;
  let healthCheck: jest.Mock;

  beforeEach(async () => {
    dbPingCheck = jest.fn().mockResolvedValue({ database: { status: 'up' } });
    uptimeIsHealthy = jest.fn().mockResolvedValue({ server: { status: 'up' } });
    redisIsHealthy = jest.fn().mockResolvedValue({ redis: { status: 'up' } });
    // Mirrors HealthCheckService.check: invoke every indicator function so
    // we can assert exactly which ones each check level wires up.
    healthCheck = jest.fn(async (indicators: Array<() => Promise<unknown>>) => {
      const results = await Promise.all(indicators.map((fn) => fn()));
      return { status: 'ok', results };
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: HealthCheckService, useValue: { check: healthCheck } },
        {
          provide: PrismaHealthIndicator,
          useValue: { pingCheck: dbPingCheck },
        },
        {
          provide: UptimeHealthIndicator,
          useValue: { isHealthy: uptimeIsHealthy },
        },
        {
          provide: RedisHealthIndicator,
          useValue: { isHealthy: redisIsHealthy },
        },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('checks only uptime for liveness', async () => {
    await service.checkLiveness();

    expect(uptimeIsHealthy).toHaveBeenCalledWith('server');
    expect(dbPingCheck).not.toHaveBeenCalled();
    expect(redisIsHealthy).not.toHaveBeenCalled();
  });

  it('checks only the database for readiness', async () => {
    await service.checkReadiness();

    expect(dbPingCheck).toHaveBeenCalledWith(
      'database',
      expect.anything(),
      expect.objectContaining({ timeout: expect.any(Number) }),
    );
    expect(uptimeIsHealthy).not.toHaveBeenCalled();
    expect(redisIsHealthy).not.toHaveBeenCalled();
  });

  it('checks database, uptime and redis for the detailed report', async () => {
    await service.checkDetailed();

    expect(dbPingCheck).toHaveBeenCalledWith(
      'database',
      expect.anything(),
      expect.objectContaining({ timeout: expect.any(Number) }),
    );
    expect(uptimeIsHealthy).toHaveBeenCalledWith('server');
    expect(redisIsHealthy).toHaveBeenCalledWith('redis');
  });
});
