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

const apiServer = {
  command: 'npx nx run api:serve:development',
  url: 'http://localhost:3000/api/health/live',
  env: {
    ...process.env,
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
