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

  // Pins the `loading` machinery: the domain stamped on each route at
  // registration, read back in setupMockApi, and the delay applied. Nothing
  // else notices if any of the three stops working.
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

      // Asserts the delay, not the skeleton: the skeleton is briefly visible
      // on any load and so proves nothing. Half the configured value clears
      // an instant response by a wide margin, with room for a slow machine.
      expect(Date.now() - startedAt).toBeGreaterThanOrEqual(
        LOADING_DELAY_MS / 2,
      );

      // Delayed, not withheld: the same response still arrives afterwards.
      await expect(page.getByTestId('job-card').first()).toBeVisible();
      await expect(page.getByTestId('loading-state')).toHaveCount(0);
    });
  });
});
