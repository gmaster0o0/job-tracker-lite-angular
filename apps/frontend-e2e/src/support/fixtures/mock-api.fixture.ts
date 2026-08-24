import { Page, Route } from '@playwright/test';
import { assertMatchesContract } from '../mocks/contract';
import { allRoutes } from '../mocks/registry';
import { LOADING_DELAY_MS, ScenarioMap } from '../scenarios';
import { MockState } from '../mocks/state';
import { HttpMethod } from '../mocks/registry';

// Registry of all routes
const mockRoutes = allRoutes;

export async function setupMockApi(
  page: Page,
  scenarios: ScenarioMap,
  state: MockState,
  mockRequests: any[],
) {
  await page.route('**/api/**', async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method() as HttpMethod;

    for (const r of mockRoutes) {
      const methods = Array.isArray(r.method) ? r.method : [r.method];
      if (!methods.includes(method)) continue;

      const m = r.pattern.exec(url.pathname);
      if (!m) continue;

      let body = undefined;
      const postData = req.postData();
      if (postData) {
        try {
          body = JSON.parse(postData);
        } catch {
          // non-JSON request body - leave `body` undefined
        }
      }

      mockRequests.push({ method, path: url.pathname, body });

      const res = await r.resolve({
        scenarios,
        state,
        method,
        url,
        params: m.groups ?? {},
        body,
      });
      // A handler may ask for its own delay; `loading` applies one to every
      // route in the domain, so the scenario works wherever it typechecks.
      const delayMs =
        res.delayMs ??
        (scenarios[r.domain] === 'loading' ? LOADING_DELAY_MS : 0);
      if (delayMs) await new Promise((done) => setTimeout(done, delayMs));

      // The guard has to answer the request even when it rejects the payload.
      // Throwing straight out of the handler leaves the route unfulfilled -
      // the browser waits forever, and the spec dies on an unrelated locator
      // timeout with the schema diff nowhere in sight. Answering with the
      // message first means the failure arrives immediately and says why.
      try {
        assertMatchesContract(url.pathname, method, res);
      } catch (error) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            message: error instanceof Error ? error.message : String(error),
          }),
        });
        throw error;
      }

      return route.fulfill({
        status: res.status,
        contentType: 'application/json',
        // `'body' in res` rather than a truthiness check: `null` is a real
        // payload here - GET /api/auth/get-session answers exactly that for a
        // logged-out visitor - and `?? {}` turned it into `{}`, so the
        // unauthenticated scenario was exercising the app's malformed-payload
        // fallback instead of its no-session path.
        body: JSON.stringify('body' in res ? res.body : {}),
      });
    }

    return route.continue();
  });
}
