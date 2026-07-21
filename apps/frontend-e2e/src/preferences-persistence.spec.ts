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

  test('migrates preferences saved under the old, separate keys', async ({
    page,
  }) => {
    await page.goto('/status');

    await page.evaluate(() => {
      localStorage.removeItem('user-preferences');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('user-lang', 'en');
      localStorage.setItem('setttings', 'YYYY-MM-DD');
    });

    await page.reload();

    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('h1').first()).toHaveText('Health Check');

    const storage = await page.evaluate(() => ({
      unified: localStorage.getItem('user-preferences'),
      legacyTheme: localStorage.getItem('theme'),
      legacyLang: localStorage.getItem('user-lang'),
      legacyDateFormat: localStorage.getItem('setttings'),
    }));

    expect(storage.unified).toContain('"theme":"dark"');
    expect(storage.legacyTheme).toBeNull();
    expect(storage.legacyLang).toBeNull();
    expect(storage.legacyDateFormat).toBeNull();
  });
});
