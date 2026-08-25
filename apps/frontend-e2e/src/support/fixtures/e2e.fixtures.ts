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

      // browser.newContext() does NOT inherit baseURL from the config `use`
      // block - only Playwright's built-in `context` fixture applies that.
      // Without it every relative request here throws "Invalid URL", and
      // because this is a worker fixture that failure takes down every test
      // in the worker, including ones that need no session at all.
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
      // Backstop against a real outbound call in the mocked lane: anything
      // that is not the app's own origin is aborted, so an accidental request
      // to a third party fails the test instead of flaking on the network.
      //
      if (!baseURL) {
        // Refuse rather than degrade. With no origin to compare against there
        // is nothing to guard, and a backstop that silently stops guarding is
        // worse than none: the next reader assumes it is still catching.
        throw new Error(
          'The mocked lane needs a baseURL to know which origin belongs to the app. Set it in playwright.config.ts or through BASE_URL.',
        );
      }

      // Derived from the resolved baseURL rather than the literal string
      // "localhost": playwright.config.ts supports pointing BASE_URL at a
      // deployed app, and a hard-coded hostname aborted the app itself for
      // every other value - 127.0.0.1 and [::1] included - leaving each
      // page.goto() to fail with net::ERR_FAILED.
      //
      // Written as a RegExp, not a predicate. Playwright can only serialise
      // string/RegExp/URLPattern matchers for the browser to filter on, and
      // falls back to intercepting `**/*` for a function - so every request
      // the page makes, the dev server's whole unbundled module graph
      // included, would round-trip to the Node client just to be evaluated
      // here. Matching only http(s) also leaves blob: and data: URLs alone;
      // the export download builds one.
      const appOrigin = new URL(baseURL).origin;
      const escapedOrigin = appOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await page.route(
        new RegExp(`^(?!${escapedOrigin}(?:[/?#]|$))https?://`),
        (r) => r.abort(),
      );
    }

    // The cookie banner is `fixed bottom-4 right-4 z-50` and shows until the
    // visitor answers it, so it sits on top of anything in that corner - the
    // delete-account button among them - and swallows the click. Recording
    // the same essential-only consent the banner's own buttons write puts
    // every spec in the "already answered" state a returning user is in.
    // CookieConsentService reads this key on construction; a spec that wants
    // to exercise the banner itself has to clear it first.
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
