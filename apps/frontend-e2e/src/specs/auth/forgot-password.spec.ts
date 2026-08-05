import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';
import { provisionUser } from '../../support/helpers/api.helper';
import { signInThroughUi } from '../../support/helpers/auth.helper';

test.describe('forgot password flow', { tag: '@full-stack-only' }, () => {
  test.use({ storageState: undefined });

  test('forgot password → email arrives → reset link → new password → login with it', async ({
    page,
    request,
    baseURL,
  }) => {
    // Provisions its own account: resetting the worker user's password would
    // invalidate the session every other test in the worker carries.
    const owner = await provisionUser(
      request,
      `reset_${Date.now()}`,
      baseURL ?? undefined,
    );
    const newPassword = 'NewSecretPassword123!';

    await page.goto('/auth/forgot-password');
    await expect(page.getByRole('heading', { name: /forgot/i })).toBeVisible();

    await page.getByLabel(/email/i).fill(owner.email);
    // Submit buttons are rendered outside their form and bound by `form`.
    await page.locator('button[form="forgotPasswordForm"]').click();

    await expect(
      page
        .getByText(
          'If an account exists for this email, a reset link has been sent',
        )
        .first(),
    ).toBeVisible();

    const email = await waitForEmail(
      request,
      owner.email,
      /Reset your password/i,
    );

    const resetLink = extractLink(email.HTML, '/auth/reset-password');
    expect(resetLink).toBeTruthy();

    await page.goto(resetLink!);
    await expect(
      page.getByRole('heading', { name: /reset password/i }),
    ).toBeVisible();

    await page.locator('#newPassword').fill(newPassword);
    await page.locator('#confirmPassword').fill(newPassword);
    await page.getByRole('button', { name: /reset/i }).click();

    await expect(
      page.getByText(/password reset successful/i).first(),
    ).toBeVisible();

    await signInThroughUi(page, owner.email, newPassword);
  });
});
