import { test, expect } from '../support/fixtures/e2e.fixtures';

test.describe('System Status', () => {
  test('should load the status page correctly', async ({ page }) => {
    await page.goto('/status');

    // The heading renders the transloco value of status.title - "Health
    // Check" - not a literal "System Status".
    await expect(
      page.getByRole('heading', { name: 'Health Check' }),
    ).toBeVisible();

    // Each dependency gets its own card with a colour-coded badge, not a
    // single "all systems operational" summary line.
    await expect(page.getByTestId('status-api-badge')).toHaveText('OK');
    await expect(page.getByTestId('status-database-badge')).toHaveText('UP');
    await expect(page.getByTestId('status-queue-badge')).toHaveText('UP');
  });

  test.describe('degraded backend', { tag: '@mock-only' }, () => {
    test.use({ scenarios: { health: 'degraded' } });

    test('reports the failing dependency', async ({ page }) => {
      await page.goto('/status');

      // The degraded fixture reports the database as down while the API
      // process itself and Redis stay up.
      await expect(page.getByTestId('status-api-badge')).toHaveText('ERROR');
      await expect(page.getByTestId('status-database-badge')).toHaveText(
        'DOWN',
      );
      await expect(page.getByTestId('status-queue-badge')).toHaveText('UP');
    });
  });
});
