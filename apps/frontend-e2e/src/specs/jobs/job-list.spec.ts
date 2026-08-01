import { test, expect } from '../../support/fixtures/e2e.fixtures';
import { jobFixtures } from '@job-tracker-lite-angular/testing';

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
});
