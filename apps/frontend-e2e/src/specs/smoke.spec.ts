import { test, expect } from '../support/fixtures/e2e.fixtures';

test.describe('smoke', () => {
  test('visit home and login page', async ({ page }) => {
    // home page shows welcome heading (use the first h1 to avoid duplicates)
    await page.goto('/');
    const firstH1 = page.locator('h1').first();
    await expect(firstH1).toBeVisible();
    // Accept either a welcome message or the app title used in this repo
    await expect(firstH1).toContainText(/Job Tracker Lite/i);
  });

  // /auth/login sits behind guestGuard, so an authenticated session - the
  // default in the mocked lane - is redirected away and the form never
  // renders. This block needs a signed-out session.
  test.describe('signed out', () => {
    // `scenarios` only drives the mock layer. In the full-stack lane the
    // session comes from the worker user's storageState, so being signed out
    // means dropping that too - otherwise guestGuard redirects away.
    test.use({
      scenarios: { auth: 'unauthenticated' },
      storageState: undefined,
    });

    test('login page renders its form', async ({ page }) => {
      await page.goto('/auth/login');
      const form = page.locator('#loginForm');
      await expect(form).toBeVisible();

      // submit button should be present and initially disabled
      const submit = page.locator('button[type="submit"]');
      await expect(submit).toBeVisible();
      await expect(submit).toBeDisabled();
    });
  });
});
