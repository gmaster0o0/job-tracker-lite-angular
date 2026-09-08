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

    // Asserts the outcome, not the landing page: where better-auth redirects
    // afterwards is its own callbackURL config, not what this test is about.
    await signInThroughUi(page, email, password);
  });

  // Same reasoning as above: asserts that the bad token left the account
  // unverified, not where the browser landed.
  test('an invalid verification token leaves the account unverified', async ({
    page,
    request,
  }) => {
    const username = `verify_invalid_${Date.now()}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';
    const name = 'Verify Invalid';

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

    // Corrupt the token, keeping the same origin and callbackURL as a
    // genuine link - the token is the only thing under test.
    const invalidLink = verifyLink!.replace(
      /token=[^&]+/,
      'token=invalid-token',
    );
    await page.goto(invalidLink);

    // Still unverified, so the login form redirects to the notice page
    // instead of signing in.
    await page.goto('/auth/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('button[form="loginForm"]').click();

    await expect(page).toHaveURL(/\/auth\/verify-email-notice/);
  });
});

// The error copy itself is rendered from the `error` query param the API
// redirects back with, so driving the app's own route proves the rendering
// without depending on better-auth's redirect configuration.
test.describe('verify email error page', { tag: '@mock-only' }, () => {
  test.use({ scenarios: { auth: 'unauthenticated' } });

  test('renders the invalid-token message', async ({ page }) => {
    await page.goto('/auth/verify-email?error=invalid_token');

    await expect(page.getByText('Email Verification Failed')).toBeVisible();
    await expect(
      page.getByText(
        'The verification link is invalid or expired. Please request a new one.',
      ),
    ).toBeVisible();
  });
});
