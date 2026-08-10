import { MockRoute } from '../registry';
import {
  degradedHealth,
  healthFixture,
} from '@job-tracker-lite-angular/testing';

// The app calls /api/health/detailed (the /status dashboard) and
// /api/health/ready (the navbar indicator). There is no bare /api/health
// route on the backend, so matching one would mock nothing.
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
        // Terminus answers 503 with the same envelope as a healthy report,
        // but with the failing dependency (here, the database) reported
        // under `error` instead of `info`.
        return { status: 503, body: degradedHealth };
      }

      return { status: 200, body: healthFixture };
    },
  },
];
