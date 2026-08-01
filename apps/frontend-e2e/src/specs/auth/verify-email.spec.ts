import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  purgeInbox,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';

test.describe('verify email flow', { tag: '@full-stack-only' }, () => {
  test.use({ storageState: undefined });

  test.beforeEach(async ({ request }) => {
    await purgeInbox(request);
  });

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

    // When we open this URL in the browser, better auth will redirect to the frontend with success/error
    // 5. Assert we are at verify-email page and it shows success
    await expect(
      page.getByRole('heading', { name: /verify your email/i }),
    ).toBeVisible();
    await expect(
      page.getByText('Your email has been verified. You can now sign in.'),
    ).toBeVisible();

    // 6. Navigate to login and login
    await page
      .getByRole('link', { name: /back to sign in|back to login/i })
      .click();
    await page.getByLabel(/email/i).fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page).toHaveURL('/jobs');
  });
});
