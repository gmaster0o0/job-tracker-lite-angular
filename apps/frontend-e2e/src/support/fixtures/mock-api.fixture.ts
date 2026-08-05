import { Page, Route } from '@playwright/test';
import { assertMatchesContract } from '../mocks/contract';
import { allRoutes } from '../mocks/registry';
import { ScenarioMap } from '../scenarios';
import { MockState } from '../mocks/state';
import { HttpMethod } from '../mocks/registry';

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
      if (res.delayMs)
        await new Promise((done) => setTimeout(done, res.delayMs));

      assertMatchesContract(url.pathname, method, res);

      return route.fulfill({
        status: res.status,
        contentType: 'application/json',
        body: JSON.stringify(res.body ?? {}),
      });
    }

    return route.continue();
  });
}
