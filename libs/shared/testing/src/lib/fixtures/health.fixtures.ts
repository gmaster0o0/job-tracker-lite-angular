import { HealthResponseDto } from '@job-tracker-lite-angular/schemas';

export const healthFixture: HealthResponseDto = {
  status: 'ok',
  info: {
    server: {
      status: 'up',
      uptime: '765s',
      timestamp: '2026-04-29T09:00:00.000Z',
    },
    database: {
      status: 'up',
      timestamp: '2026-04-29T09:00:00.000Z',
    },
    redis: {
      status: 'up',
      timestamp: '2026-04-29T09:00:00.000Z',
    },
  },
  error: {},
  details: {
    server: {
      status: 'up',
      uptime: '765s',
      timestamp: '2026-04-29T09:00:00.000Z',
    },
    database: {
      status: 'up',
      timestamp: '2026-04-29T09:00:00.000Z',
    },
    redis: {
      status: 'up',
      timestamp: '2026-04-29T09:00:00.000Z',
    },
  },
};

export const degradedHealth: HealthResponseDto = {
  status: 'error',
  info: {
    server: { status: 'up', uptime: '120s' },
    redis: { status: 'up' },
  },
  error: {
    server: { status: 'up', uptime: '120s' },
    database: { status: 'down' },
  },
  details: {
    server: {
      status: 'up',
      uptime: '120s',
      timestamp: '2026-05-09T09:00:00.000Z',
    },
    redis: { status: 'up' },
  },
};
