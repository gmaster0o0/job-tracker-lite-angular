import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  purgeInbox,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';

test.describe('account settings', { tag: '@full-stack-only' }, () => {
  test.beforeEach(async ({ request }) => {
    await purgeInbox(request);
  });

  test('change email → confirm link from Mailpit → email updated', async ({
    page,
    request,
    workerUser,
  }) => {
    test.skip(!workerUser, 'Worker user is required for full-stack only tests');

    const newEmail = `changed_${Date.now()}@example.com`;

    // Go to settings page
    await page.goto('/settings/account');

    // Wait for the change email form
    await expect(page.locator('#changeEmailForm')).toBeVisible();

    // Fill the new email
    await page.locator('#newEmail').fill(newEmail);

    // Save
    // We select the button within the change email form
    await page
      .locator('#changeEmailForm')
      .getByRole('button', { name: /save/i })
      .click();

    // Verification sent notice
    await expect(
      page.getByText('Verification email sent to your new address.'),
    ).toBeVisible();

    // Wait for email from Mailpit
    const emailMsg = await waitForEmail(
      request,
      newEmail,
      /Confirm your email change/i,
    );

    // Extract link
    const confirmLink = extractLink(emailMsg.HTML, '/api/auth');
    expect(confirmLink).toBeTruthy();

    // Navigate to the link
    await page.goto(confirmLink!);

    // That link should verify the email and redirect, maybe to verify-email success or directly login
    // The current better-auth behavior for email change verification is to verify and redirect
    // Let's assert based on UI or simply logging in with the new email
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(newEmail);
    await page.locator('input[type="password"]').fill(workerUser!.password);
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page).toHaveURL('/jobs');
  });
});
