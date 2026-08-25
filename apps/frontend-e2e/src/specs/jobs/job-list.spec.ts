import { test, expect } from '../../support/fixtures/e2e.fixtures';
import { jobFixtures } from '@job-tracker-lite-angular/testing';
import { LOADING_DELAY_MS } from '../../support/scenarios';

test.describe('Job List', () => {
  test('list renders cards from fixtures', async ({ page }) => {
    await page.goto('/jobs');

    // Asserts shape - we expect at least one card to be visible
    await expect(page.getByTestId('job-card').first()).toBeVisible();

    // Check one of the known fixtures is rendered instead of enforcing strict index order
    await expect(
      page
        .getByTestId('job-card')
        .filter({ hasText: jobFixtures.frontendEngineer.position })
        .first(),
    ).toBeVisible();
  });

  test.describe('empty state', { tag: '@mock-only' }, () => {
    test.use({ scenarios: { jobs: 'noData' } });

    test('shows empty state', async ({ page }) => {
      await page.goto('/jobs');
      await expect(page.getByTestId('empty-state')).toBeVisible();
    });
  });

  test.describe('500 error state', { tag: '@mock-only' }, () => {
    test.use({ scenarios: { jobs: 'serverError' } });

    test('shows error state', async ({ page }) => {
      await page.goto('/jobs');
      await expect(page.getByTestId('error-state')).toBeVisible();
    });
  });

  // Covers the `loading` scenario end to end, which is otherwise three
  // untested moving parts: registerRoutes stamping a domain onto each route,
  // setupMockApi reading it back, and the delay being applied. Dropping any
  // of them makes the delay silently stop happening - the exact silent no-op
  // the central implementation replaced - and only this spec would notice.
  test.describe('loading state', { tag: '@mock-only' }, () => {
    test.use({ scenarios: { jobs: 'loading' } });

    test('holds the response back so the skeleton stays up', async ({
      page,
    }) => {
      // Registered before the navigation that triggers it.
      const jobsResponse = page.waitForResponse((response) =>
        /\/api\/jobs$/.test(new URL(response.url()).pathname),
      );
      const startedAt = Date.now();

      await page.goto('/jobs');
      await expect(page.getByTestId('loading-state')).toBeVisible();
      await jobsResponse;

      // The skeleton alone proves nothing - it is briefly visible on any
      // load - so this asserts the delay itself. Half the configured value
      // clears an instant response by a wide margin while leaving room for a
      // slow machine.
      expect(Date.now() - startedAt).toBeGreaterThanOrEqual(
        LOADING_DELAY_MS / 2,
      );

      // Delayed, not withheld: the same response still arrives afterwards.
      await expect(page.getByTestId('job-card').first()).toBeVisible();
      await expect(page.getByTestId('loading-state')).toHaveCount(0);
    });
  });
});
