import { test, expect } from '../support/fixtures/e2e.fixtures';

test.describe('System Status', () => {
  test('should load the status page correctly', async ({ page }) => {
    await page.goto('/status');

    // The heading renders the transloco value of status.title - "Health
    // Check" - not a literal "System Status".
    await expect(
      page.getByRole('heading', { name: 'Health Check' }),
    ).toBeVisible();

    // Each dependency is reported on its own row; there is no single
    // "all systems operational" summary line on this page.
    await expect(page.getByText('API', { exact: true })).toBeVisible();
    await expect(page.getByText('Database', { exact: true })).toBeVisible();
  });
});
