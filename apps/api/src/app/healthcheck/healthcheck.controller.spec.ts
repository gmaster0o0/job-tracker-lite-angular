import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './healthcheck.controller';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { UptimeHealthIndicator } from './uptime.health';
import { PrismaService } from '@job-tracker-lite-angular/prisma';

describe('HealthcheckController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: {} },
        { provide: PrismaHealthIndicator, useValue: {} },
        { provide: UptimeHealthIndicator, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
