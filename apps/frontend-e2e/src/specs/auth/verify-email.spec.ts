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

    // 1. Register a new user
    await page.goto('/auth/register');
    await page.getByLabel(/name/i).fill(name);
    await page.getByLabel(/email/i).fill(email);

    await page.locator('#password').fill(password);
    await page.locator('#confirmPassword').fill(password);

    await page.getByRole('button', { name: /create account/i }).click();

    // 2. Expect notice screen
    await expect(
      page.getByText(
        'Registration successful. Please check your email to verify your account.',
      ),
    ).toBeVisible();

    // 3. Wait for the email
    const emailMsg = await waitForEmail(request, email, /Verify your email/i);

    // 4. Extract link and navigate
    // In Better Auth, the link might be like `http://localhost:4200/api/auth/verify-email?token=` or similar
    const verifyLink = extractLink(emailMsg.HTML, '/api/auth/verify-email');
    expect(verifyLink).toBeTruthy();

    await page.goto(verifyLink!);

    // better-auth redirects to whatever callbackURL was registered when the
    // verification mail was sent, which is not guaranteed to be the
    // frontend's verify-email page. Asserting that landing page makes this
    // test about better-auth's redirect config; assert the outcome that
    // actually matters instead - the account can now sign in.
    await signInThroughUi(page, email, password);
  });

  // An invalid token is trivial to reproduce against the real backend - no
  // need to mock better-auth's rejection.
  test('invalid verification token shows an error', async ({
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

    // Corrupt the token so better-auth rejects it, keeping the same origin
    // and callbackURL as a genuine link - the token is the only thing under
    // test.
    const invalidLink = verifyLink!.replace(
      /token=[^&]+/,
      'token=invalid-token',
    );
    await page.goto(invalidLink);

    await expect(page.getByText('Email Verification Failed')).toBeVisible();
    await expect(
      page.getByText(
        'The verification link is invalid or expired. Please request a new one.',
      ),
    ).toBeVisible();
  });
});
