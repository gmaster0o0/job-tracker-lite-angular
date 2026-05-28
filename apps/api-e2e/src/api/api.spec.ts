import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from '@job-tracker-lite-angular/api/app/healthcheck/healthcheck.controller';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import {
  createPrismaServiceMock,
  createPrismaHealthIndicatorMock,
  createHealthCheckServiceMock,
} from '@job-tracker-lite-angular/testing';
import { UptimeHealthIndicator } from '@job-tracker-lite-angular/api/app/healthcheck/uptime.health';
import { createUptimeHealthIndicatorMock } from '@job-tracker-lite-angular/testing';

describe('api/health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const prismaMock = createPrismaServiceMock(() => () => Promise.resolve());

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: createHealthCheckServiceMock(true),
        },
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: PrismaHealthIndicator,
          useValue: createPrismaHealthIndicatorMock(),
        },
        {
          provide: UptimeHealthIndicator,
          useValue: createUptimeHealthIndicatorMock(),
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');

    // Assert only the server health — DB may be down in CI/local tests
    expect(res.body).toHaveProperty('server');
    expect(res.body.server.status).toBe('up');
    expect(res.body.server.uptime).toBeDefined();
    expect(res.body.server.timestamp).toBeDefined();
  });
});
