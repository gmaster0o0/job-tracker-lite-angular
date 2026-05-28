import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('visit home and login page', async ({ page }) => {
    // home page shows welcome heading (use the first h1 to avoid duplicates)
    await page.goto('/');
    const firstH1 = page.locator('h1').first();
    await expect(firstH1).toBeVisible();
    // Accept either a welcome message or the app title used in this repo
    await expect(firstH1).toContainText(/Welcome|Job Tracker Lite/i);

    // navigate to login page and assert login form exists
    await page.goto('/auth/login');
    const form = page.locator('#loginForm');
    await expect(form).toBeVisible();

    // submit button should be present and initially disabled
    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeVisible();
    await expect(submit).toBeDisabled();
  });
});
