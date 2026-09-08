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
    // Owns its account: the reset invalidates the session. ADR-0004,
    // "Operating rules".
    const owner = await provisionUser(
      request,
      `reset_${Date.now()}`,
      baseURL ?? undefined,
    );
    const newPassword = 'NewSecretPassword123!';

    await page.goto('/auth/forgot-password');
    await expect(page.getByRole('heading', { name: /forgot/i })).toBeVisible();

    await page.getByLabel(/email/i).fill(owner.email);
    // Bound to the form by the `form` attribute rather than nested in it.
    await page.locator('button[form="forgotPasswordForm"]').click();

    // The copy appears in more than one node, so scope to the first match.
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

    // What this proves: the new password works.
    await signInThroughUi(page, owner.email, newPassword);
  });
});

// Mocked: rate limiting and a backend outage are both hard to produce against
// a live server on demand. A sibling describe rather than a nested one - the
// block above is @full-stack-only, and both tags together would leave these
// running in no project at all.
test.describe(
  'forgot password flow - unhappy paths',
  { tag: '@mock-only' },
  () => {
    test.describe('rate limited', () => {
      test.use({ scenarios: { auth: 'rateLimited' } });

      test('shows an error instead of the success message', async ({
        page,
      }) => {
        await page.goto('/auth/forgot-password');
        await page.getByLabel(/email/i).fill('someone@example.com');
        await page.locator('button[form="forgotPasswordForm"]').click();

        await expect(page.getByText('Reset Link Request Failed')).toBeVisible();
        await expect(
          page.getByText(
            'If an account exists for this email, a reset link has been sent',
          ),
        ).toHaveCount(0);
      });
    });

    test.describe('server error', () => {
      test.use({ scenarios: { auth: 'serverError' } });

      test('shows an error instead of the success message', async ({
        page,
      }) => {
        await page.goto('/auth/forgot-password');
        await page.getByLabel(/email/i).fill('someone@example.com');
        await page.locator('button[form="forgotPasswordForm"]').click();

        await expect(page.getByText('Reset Link Request Failed')).toBeVisible();
      });
    });
  },
);
