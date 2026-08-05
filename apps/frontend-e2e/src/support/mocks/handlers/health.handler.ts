import { MockRoute } from '../registry';
import { healthFixture } from '@job-tracker-lite-angular/testing';

// There is no bare /api/health route on the backend.
const HEALTH_PATH = /^\/api\/health\/(live|ready|detailed)$/;

export const healthRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: HEALTH_PATH,
    resolve: ({ scenarios }) => {
      if (scenarios.health === 'serverError') {
        return { status: 500, body: { message: 'Server error' } };
      }

      if (scenarios.health === 'degraded') {
        // Terminus answers 503 with the same envelope as a healthy report.
        return {
          status: 503,
          body: {
            ...healthFixture,
            status: 'error',
          },
        };
      }

      return { status: 200, body: healthFixture };
    },
  },
];
