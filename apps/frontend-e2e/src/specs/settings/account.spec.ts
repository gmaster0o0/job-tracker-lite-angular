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

    await page.goto('/settings/account');

    await expect(page.locator('#changeEmailForm')).toBeVisible();

    await page.locator('#newEmail').fill(newEmail);

    // Submit buttons are rendered outside their form and bound by `form`,
    // which also disambiguates this from the change-password button.
    await page.locator('button[form="changeEmailForm"]').click();

    await expect(
      page.getByText('Verification email sent to your new address.'),
    ).toBeVisible();

    const emailMsg = await waitForEmail(
      request,
      newEmail,
      /Confirm your email change/i,
    );

    // The confirmation endpoint is on the account controller, not /api/auth.
    const confirmLink = extractLink(
      emailMsg.HTML,
      '/api/account/verify-email-change',
    );
    expect(confirmLink).toBeTruthy();

    await page.goto(confirmLink!);

    // Confirming signs the session out, so signing in proves the new address.
    await signInThroughUi(page, newEmail, workerUser!.password);
  });
});
