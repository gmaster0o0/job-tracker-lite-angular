import type { BrowserContext } from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { defaultScenarios, ScenarioMap } from '../scenarios';
import { createMockState, MockState } from '../mocks/state';
import { setupMockApi } from './mock-api.fixture';
import {
  provisionUser,
  deleteUser,
  seedUser,
  ProvisionedUser,
} from '../helpers/api.helper';

export type StorageStateValue = Awaited<
  ReturnType<BrowserContext['storageState']>
>;

export interface RecordedRequest {
  method: string;
  path: string;
  body: unknown;
}

// `useMocks` is worker-scoped: `workerUser` is a worker fixture, and a
// worker-scoped fixture may only depend on other worker-scoped ones.
// `scenarios` stays test-scoped so a describe block can override it.
export interface WorkerOptions {
  useMocks: boolean;
}

export interface TestOptions {
  scenarios: Partial<ScenarioMap>;
}

// The shape playwright.config.ts declares via defineConfig<E2EOptions>.
export type E2EOptions = WorkerOptions & TestOptions;

export type E2EFixtures = {
  mockApi: { requests: RecordedRequest[] };
  state: MockState | undefined;
  storageState: StorageStateValue | undefined;
};

export type WorkerFixtures = WorkerOptions & {
  workerUser: (ProvisionedUser & { storageState: StorageStateValue }) | null;
};

export const test = base.extend<TestOptions & E2EFixtures, WorkerFixtures>({
  useMocks: [false, { scope: 'worker', option: true }],
  scenarios: [defaultScenarios, { option: true }],

  workerUser: [
    async ({ browser, useMocks }, use, workerInfo) => {
      if (useMocks) {
        await use(null);
        return;
      }

      // Passed explicitly: browser.newContext() does not inherit baseURL from
      // the config `use` block, only the built-in `context` fixture does.
      const baseURL = workerInfo.project.use.baseURL;

      const ctx = await browser.newContext({ baseURL });
      const api = ctx.request;

      const user = await provisionUser(
        api,
        `w${workerInfo.workerIndex}_${Date.now()}`,
        baseURL,
      );

      // better-auth is configured with autoSignIn, so the context now holds a
      // session cookie and can seed data as the freshly created user.
      await seedUser(api, user);

      const storageState = await ctx.storageState();
      await ctx.close();

      await use({ ...user, storageState });

      // Teardown runs in its own context, restoring the session first so the
      // delete-user call is authenticated.
      const tdCtx = await browser.newContext({ baseURL, storageState });
      const tdApi = tdCtx.request;
      await deleteUser(tdApi, user, baseURL);
      await tdCtx.close();
    },
    { scope: 'worker' },
  ],

  storageState: async ({ workerUser }, use) =>
    use(workerUser?.storageState ?? undefined),

  state: async ({ useMocks, scenarios }, use) => {
    if (useMocks) {
      // Merge user scenarios with defaults
      const mergedScenarios = { ...defaultScenarios, ...scenarios };
      const state = createMockState(mergedScenarios);
      await use(state);
    } else {
      await use(undefined);
    }
  },

  mockApi: [
    async ({ page, useMocks, scenarios, state }, use) => {
      const requests: RecordedRequest[] = [];
      if (useMocks && state) {
        const mergedScenarios = { ...defaultScenarios, ...scenarios };
        await setupMockApi(page, mergedScenarios, state, requests);
      }
      await use({ requests });
    },
    { auto: true },
  ],

  page: async ({ page, useMocks, baseURL }, use) => {
    if (useMocks) {
      // Outbound backstop - see "Operating rules" in ADR-0004 for why it
      // compares origins and must stay a serialisable matcher.
      if (!baseURL) {
        throw new Error(
          'The mocked lane needs a baseURL to know which origin belongs to the app. Set it in playwright.config.ts or through BASE_URL.',
        );
      }

      // http(s) only, so the blob: URL the export download builds is left
      // alone.
      const appOrigin = new URL(baseURL).origin;
      const escapedOrigin = appOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await page.route(
        new RegExp(`^(?!${escapedOrigin}(?:[/?#]|$))https?://`),
        (r) => r.abort(),
      );
    }

    // Pre-answers the cookie banner, which otherwise covers the bottom-right
    // corner and swallows clicks. Same essential-only consent its own buttons
    // write; a spec exercising the banner clears this key first.
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'cookieConsent',
        JSON.stringify({ essential: true }),
      );
    });

    await use(page);
  },
});

export { expect };
