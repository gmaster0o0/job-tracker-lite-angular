import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  purgeInbox,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';

test.describe('forgot password flow', { tag: '@full-stack-only' }, () => {
  // test needs unauthenticated start
  test.use({ storageState: undefined });

  test.beforeEach(async ({ request }) => {
    await purgeInbox(request);
  });

  test('forgot password → email arrives → reset link → new password → login with it', async ({
    page,
    request,
    workerUser,
  }) => {
    test.skip(!workerUser, 'Worker user is required for full-stack only tests');

    // Make sure we have a known password for the worker user initially
    const newPassword = 'NewSecretPassword123!';

    // Navigate to forgot password page
    await page.goto('/auth/forgot-password');
    await expect(page.getByRole('heading', { name: /forgot/i })).toBeVisible();

    // Fill in email
    await page.getByLabel(/email/i).fill(workerUser!.user.email);
    // Submit
    await page.getByRole('button', { name: /submit/i }).click();

    // Expect success message
    await expect(
      page.getByText(
        'If an account exists for this email, a reset link has been sent',
      ),
    ).toBeVisible();

    // Wait for the reset password email via Mailpit
    const email = await waitForEmail(
      request,
      workerUser!.user.email,
      /Reset your password/i,
    );

    // Get the reset link from the HTML body
    const resetLink = extractLink(email.HTML, '/auth/reset-password');
    expect(resetLink).toBeTruthy();

    // Navigate to reset link
    await page.goto(resetLink!);

    // Check we are on reset password page
    await expect(
      page.getByRole('heading', { name: /reset password/i }),
    ).toBeVisible();

    // Fill new password
    await page.locator('#newPassword').fill(newPassword);
    await page.locator('#confirmPassword').fill(newPassword);

    // Submit
    await page.getByRole('button', { name: /reset/i }).click();

    // Expect success
    await expect(
      page.getByText(/password has been reset successfully/i),
    ).toBeVisible();

    // Go to login page and login with new password
    await page.getByRole('link', { name: /back to login/i }).click();
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    await page.getByLabel(/email/i).fill(workerUser!.user.email);
    await page.getByLabel(/password/i).fill(newPassword);
    await page.getByRole('button', { name: /login/i }).click();

    // We should be logged in (e.g. redirected to /jobs or no longer on login)
    await expect(page).toHaveURL('/jobs');
  });
});
