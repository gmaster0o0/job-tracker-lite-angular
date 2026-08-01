import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

import { ScenarioMap } from './src/support/scenarios';

export interface E2EOptions {
  useMocks: boolean;
  scenarios: Partial<ScenarioMap>;
}

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

// The full-stack lane must not run against the dev stack: it creates and
// deletes real users and jobs. docker-compose.test.yml exposes Postgres,
// Redis and Mailpit on offset ports, and these defaults point the API there.
//
// CI sets all of these explicitly (service containers, default ports), and an
// already-set value always wins, so the same config serves both.
const testStackEnv = {
  DATABASE_URL:
    process.env['DATABASE_URL'] ??
    'postgresql://test:test@localhost:5433/job_tracker_test?schema=public',
  REDIS_HOST: process.env['REDIS_HOST'] ?? 'localhost',
  REDIS_PORT: process.env['REDIS_PORT'] ?? '6380',
  EMAIL_PROVIDER: process.env['EMAIL_PROVIDER'] ?? 'mailpit',
  MAILPIT_HOST: process.env['MAILPIT_HOST'] ?? 'localhost',
  MAILPIT_PORT: process.env['MAILPIT_PORT'] ?? '1026',
};

// Read by mailpit.helper in the test process, not by the API.
process.env['MAILPIT_API'] ??= `http://localhost:${
  process.env['MAILPIT_UI_PORT'] ?? '8026'
}/api/v1`;

const apiServer = {
  command: 'npx nx run api:serve:development',
  url: 'http://localhost:3000/api/health/live',
  env: {
    ...process.env,
    ...testStackEnv,
    PORT: '3000',
    NX_NO_CLOUD: 'true',
    NODE_OPTIONS: '',
  },
  reuseExistingServer: true,
  timeout: 120000,
  cwd: workspaceRoot,
};

const frontendServer = {
  command: 'npx nx run frontend:serve-e2e -- --port 4200',
  url: 'http://localhost:4200',
  env: {
    ...process.env,
    API_PORT: '3000',
    NX_NO_CLOUD: 'true',
    NODE_OPTIONS: '',
  },
  reuseExistingServer: true,
  timeout: 120000,
  cwd: workspaceRoot,
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<E2EOptions>({
  ...nxE2EPreset(__filename, { testDir: './src/specs' }),
  fullyParallel: true,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    testIdAttribute: 'data-testid',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    useMocks: false,
    scenarios: {},
  },
  /* Run the API and frontend dev servers before starting the tests */
  webServer:
    process.env['E2E_MOCKED'] === 'true'
      ? [frontendServer]
      : [apiServer, frontendServer],
  projects: [
    {
      name: 'mocked',
      use: { ...devices['Desktop Chrome'], useMocks: true },
      grepInvert: /@full-stack-only/,
    },
    {
      name: 'full-stack',
      use: { ...devices['Desktop Chrome'], useMocks: false },
      grepInvert: /@mock-only/,
    },
    {
      name: 'full-stack-mocked',
      use: { ...devices['Desktop Chrome'], useMocks: true },
      grep: /@mock-only/,
    },
  ],
});
