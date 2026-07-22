import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run the API and frontend dev servers before starting the tests */
  webServer: [
    {
      command: 'npx nx run api:serve:development',
      // Not the bare /api/health - that path has no route (only
      // /live, /ready, /detailed do) and 404s, which Playwright's own
      // isURLAvailable check explicitly never treats as "available"
      // (statusCode >= 200 && statusCode < 404), so this entry could
      // never be detected as ready regardless of anything else here.
      url: 'http://localhost:3000/api/health/live',
      env: {
        ...process.env,
        PORT: '3000',
        NX_NO_CLOUD: 'true',
        NODE_OPTIONS: '',
      },
      // In CI, this server is started by an earlier workflow step, outside
      // of any Nx process - `npx nx run ...` here would be a *nested* Nx
      // CLI call (this whole config only runs as part of `frontend-e2e:e2e`,
      // itself an Nx target), and without the daemon (which Nx disables
      // whenever CI=true) that nested invocation deadlocks against the
      // still-running outer one until this timeout fires. Always reuse
      // what's already there instead of ever attempting that.
      reuseExistingServer: true,
      timeout: 120000,
      cwd: workspaceRoot,
    },
    {
      command: 'npx nx run frontend:serve-e2e -- --port 4200',
      url: 'http://localhost:4200',
      env: {
        ...process.env,
        API_PORT: '3000',
        NX_NO_CLOUD: 'true',
        NODE_OPTIONS: '',
      },
      // Same reasoning as the API entry above.
      reuseExistingServer: true,
      timeout: 120000,
      cwd: workspaceRoot,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
