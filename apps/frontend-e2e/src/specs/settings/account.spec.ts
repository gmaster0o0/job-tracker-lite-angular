import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';
import { signInThroughUi } from '../../support/helpers/auth.helper';

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

    // Confirming the change signs the session out, so the proof that the new
    // address took effect is that it can be used to sign in.
    await signInThroughUi(page, newEmail, workerUser!.password);
  });
});
