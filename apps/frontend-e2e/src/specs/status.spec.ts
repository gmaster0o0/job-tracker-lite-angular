import { test, expect } from '../support/fixtures/e2e.fixtures';

test.describe('System Status', () => {
  test('should load the status page correctly', async ({ page }) => {
    await page.goto('/status');

    await expect(
      page.getByRole('heading', { name: 'Health Check' }),
    ).toBeVisible();

    await expect(page.getByText('API', { exact: true })).toBeVisible();
    await expect(page.getByText('Database', { exact: true })).toBeVisible();
  });
});
