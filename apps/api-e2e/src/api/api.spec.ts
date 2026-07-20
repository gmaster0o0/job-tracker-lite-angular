import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from '@job-tracker-lite-angular/api/app/healthcheck/healthcheck.controller';
import { HealthService } from '@job-tracker-lite-angular/api/app/healthcheck/healthcheck.service';

describe('api/health', () => {
  let app: INestApplication;
  let healthService: { checkLiveness: jest.Mock };

  beforeAll(async () => {
    healthService = {
      checkLiveness: jest.fn().mockResolvedValue({
        status: 'ok',
        info: {
          server: {
            status: 'up',
            uptime: `${Math.floor(process.uptime())}`,
            timestamp: new Date().toISOString(),
          },
        },
        error: {},
        details: {
          server: {
            status: 'up',
            uptime: `${Math.floor(process.uptime())}`,
            timestamp: new Date().toISOString(),
          },
        },
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/health/live', async () => {
    const res = await request(app.getHttpServer()).get('/api/health/live');

    expect(res.body.details).toHaveProperty('server');
    expect(res.body.details.server.status).toBe('up');
    expect(res.body.details.server.uptime).toBeDefined();
    expect(res.body.details.server.timestamp).toBeDefined();
  });
});
