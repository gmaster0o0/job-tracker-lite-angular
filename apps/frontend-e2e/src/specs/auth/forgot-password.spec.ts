import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';
import { provisionUser } from '../../support/helpers/api.helper';
import { signInThroughUi } from '../../support/helpers/auth.helper';

test.describe('forgot password flow', { tag: '@full-stack-only' }, () => {
  // test needs unauthenticated start
  test.use({ storageState: undefined });
  test('forgot password → email arrives → reset link → new password → login with it', async ({
    page,
    request,
    baseURL,
  }) => {
    // This test changes a password, so it provisions its own account rather
    // than mutating the worker-scoped user. Sharing that user makes the run
    // order-dependent: the reset invalidates the session every other test in
    // the worker is carrying in storageState.
    const owner = await provisionUser(
      request,
      `reset_${Date.now()}`,
      baseURL ?? undefined,
    );
    const newPassword = 'NewSecretPassword123!';

    // Navigate to forgot password page
    await page.goto('/auth/forgot-password');
    await expect(page.getByRole('heading', { name: /forgot/i })).toBeVisible();

    // Fill in email
    await page.getByLabel(/email/i).fill(owner.email);
    // The submit button sits outside the <form>, wired to it by the `form`
    // attribute, so scoping the lookup inside the form finds nothing. Its
    // label is "Send reset link", not "Submit".
    await page.locator('button[form="forgotPasswordForm"]').click();

    // The copy appears in more than one node, so scope to the first match.
    await expect(
      page
        .getByText(
          'If an account exists for this email, a reset link has been sent',
        )
        .first(),
    ).toBeVisible();

    // Wait for the reset password email via Mailpit
    const email = await waitForEmail(
      request,
      owner.email,
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

    // auth.resetPassword.success - the page redirects to sign in on its own.
    await expect(
      page.getByText(/password reset successful/i).first(),
    ).toBeVisible();

    // What this test proves is that the new password works.
    await signInThroughUi(page, owner.email, newPassword);
  });
});

// Rate limiting and a genuine backend outage are both hard to reproduce
// against a live server on demand, so these run mocked instead. A sibling
// describe, not nested in the block above: that one is @full-stack-only,
// and combining the two tags would leave these tests running in no project.
test.describe(
  'forgot password flow - unhappy paths',
  { tag: '@mock-only' },
  () => {
    test.use({ storageState: undefined });

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
