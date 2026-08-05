import { test, expect } from '../support/fixtures/e2e.fixtures';

test.describe('smoke', () => {
  test('visit home and login page', async ({ page }) => {
    await page.goto('/');
    const firstH1 = page.locator('h1').first();
    await expect(firstH1).toBeVisible();
    await expect(firstH1).toContainText(/Job Tracker Lite/i);
  });

  test.describe('signed out', () => {
    // /auth/login is behind guestGuard. `scenarios` only drives the mock
    // layer, so the full-stack lane needs storageState dropped as well.
    test.use({
      scenarios: { auth: 'unauthenticated' },
      storageState: undefined,
    });

    test('login page renders its form', async ({ page }) => {
      await page.goto('/auth/login');
      const form = page.locator('#loginForm');
      await expect(form).toBeVisible();

      const submit = page.locator('button[type="submit"]');
      await expect(submit).toBeVisible();
      await expect(submit).toBeDisabled();
    });
  });
});
