import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';

test.describe('account settings', { tag: '@full-stack-only' }, () => {
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

    // The submit button is rendered outside the <form> and bound to it with
    // the `form` attribute, so it is not a descendant of #changeEmailForm.
    // Selecting on that attribute also disambiguates it from the
    // change-password form's button on the same page.
    await page.locator('button[form="changeEmailForm"]').click();

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

    // The confirmation endpoint is on the account controller
    // (@Get('verify-email-change')), not under /api/auth.
    const confirmLink = extractLink(
      emailMsg.HTML,
      '/api/account/verify-email-change',
    );
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
