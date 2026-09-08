import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';
import { signInThroughUi } from '../../support/helpers/auth.helper';
import { provisionUser } from '../../support/helpers/api.helper';

test.describe('account settings', { tag: '@full-stack-only' }, () => {
  // Owns its account: confirming an email change rewrites `user.email` and
  // deletes the user's session rows. ADR-0004, "Operating rules".
  test.use({ storageState: undefined });

  test('change email → confirm link from Mailpit → email updated', async ({
    page,
    request,
    baseURL,
  }) => {
    const owner = await provisionUser(
      request,
      `chemail_${Date.now()}`,
      baseURL ?? undefined,
    );
    const newEmail = `changed_${Date.now()}@example.com`;

    await signInThroughUi(page, owner.email, owner.password);

    await page.goto('/settings/account');
    await expect(page.locator('#changeEmailForm')).toBeVisible();
    await page.locator('#newEmail').fill(newEmail);

    // Bound to the form by the `form` attribute rather than nested in it,
    // which also disambiguates it from the change-password button.
    await page.locator('button[form="changeEmailForm"]').click();

    await expect(
      page.getByText('Verification email sent to your new address.'),
    ).toBeVisible();

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

    await page.goto(confirmLink!);

    // Confirming signs the session out, so the proof the new address took
    // effect is that it can be used to sign in.
    await signInThroughUi(page, newEmail, owner.password);
  });

  // Own accounts here for a second reason: a successful request starts the
  // resend cooldown, which disables the button for anything sharing it.
  test.describe('unhappy paths', () => {
    test('rejects changing to the current email', async ({
      page,
      request,
      baseURL,
    }) => {
      const user = await provisionUser(
        request,
        `acct_same_${Date.now()}`,
        baseURL ?? undefined,
      );
      await signInThroughUi(page, user.email, user.password);

      await page.goto('/settings/account');
      await expect(page.locator('#changeEmailForm')).toBeVisible();

      await page.locator('#newEmail').fill(user.email);
      await page.locator('button[form="changeEmailForm"]').click();

      await expect(page.getByText('Email Update Failed')).toBeVisible();
      await expect(
        page.getByText('Please use a different email than your current one.'),
      ).toBeVisible();
    });

    test('rejects changing to an email already registered to another account', async ({
      page,
      request,
      baseURL,
    }) => {
      const other = await provisionUser(
        request,
        `acct_other_${Date.now()}`,
        baseURL ?? undefined,
      );
      const user = await provisionUser(
        request,
        `acct_taken_${Date.now()}`,
        baseURL ?? undefined,
      );
      await signInThroughUi(page, user.email, user.password);

      await page.goto('/settings/account');
      await expect(page.locator('#changeEmailForm')).toBeVisible();

      await page.locator('#newEmail').fill(other.email);
      await page.locator('button[form="changeEmailForm"]').click();

      await expect(page.getByText('Email Update Failed')).toBeVisible();
      await expect(
        page.getByText('An account with this email already exists.'),
      ).toBeVisible();
    });
  });
});
