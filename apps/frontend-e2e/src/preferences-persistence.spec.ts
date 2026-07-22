import { test, expect } from '@playwright/test';

// Regression coverage for a bug where saved theme/language/date-format
// preferences were ignored on a fresh page load (F5) - they only took
// effect after visiting /settings/preferences, because the services that
// applied them were never constructed before that. /status is used here
// because, like the root layout, it now runs preferencesInitGuard, but
// unlike the root layout it needs no authenticated session.
test.describe('preferences persistence', () => {
  test('applies stored theme and language after a reload', async ({ page }) => {
    await page.goto('/status');

    await page.evaluate(() => {
      localStorage.setItem(
        'user-preferences',
        JSON.stringify({
          theme: 'dark',
          language: 'en',
          dateFormat: 'YYYY-MM-DD',
        }),
      );
    });

    await page.reload();

    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('h1').first()).toHaveText('Health Check');
  });
});
