import { test, expect } from '../support/fixtures/e2e.fixtures';

test.describe('System Status', () => {
  test('should load the status page correctly', async ({ page }) => {
    await page.goto('/status');

    await expect(
      page.getByRole('heading', { name: 'System Status' }),
    ).toBeVisible();
    await expect(page.getByText('All systems operational')).toBeVisible();
  });
});
