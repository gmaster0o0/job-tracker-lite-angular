import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { UptimeHealthIndicator } from './uptime.health';

describe('UptimeHealthIndicator', () => {
  let indicator: UptimeHealthIndicator;
  let healthIndicatorService: HealthIndicatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UptimeHealthIndicator,
        {
          provide: HealthIndicatorService,
          useValue: {
            check: jest.fn().mockReturnValue({
              up: jest.fn((data) => ({ status: 'up', ...data })),
            }),
          },
        },
      ],
    }).compile();

    indicator = module.get<UptimeHealthIndicator>(UptimeHealthIndicator);
    healthIndicatorService = module.get<HealthIndicatorService>(
      HealthIndicatorService,
    );
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should return uptime and timestamp data', async () => {
    jest.spyOn(process, 'uptime').mockReturnValue(3600);

    const result = await indicator.isHealthy('uptime_test');

    expect(healthIndicatorService.check).toHaveBeenCalledWith('uptime_test');
    expect(result).toEqual(
      expect.objectContaining({
        status: 'up',
        uptime: '3600',
        timestamp: expect.any(String),
      }),
    );
  });
});
