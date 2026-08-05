import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';
import { signInThroughUi } from '../../support/helpers/auth.helper';

test.describe('verify email flow', { tag: '@full-stack-only' }, () => {
  test.use({ storageState: undefined });

  test('verify-email link from Mailpit → verified state', async ({
    page,
    request,
  }) => {
    const username = `verify_${Date.now()}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';
    const name = 'Verify Me';

    await page.goto('/auth/register');
    await page.getByLabel(/name/i).fill(name);
    await page.getByLabel(/email/i).fill(email);
    await page.locator('#password').fill(password);
    await page.locator('#confirmPassword').fill(password);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(
      page.getByText(
        'Registration successful. Please check your email to verify your account.',
      ),
    ).toBeVisible();

    const emailMsg = await waitForEmail(request, email, /Verify your email/i);
    const verifyLink = extractLink(emailMsg.HTML, '/api/auth/verify-email');
    expect(verifyLink).toBeTruthy();

    await page.goto(verifyLink!);

    // Where better-auth redirects afterwards depends on the callbackURL
    // registered when the mail was sent, so verification is proven by signing
    // in rather than by the landing page.
    await signInThroughUi(page, email, password);
  });
});
