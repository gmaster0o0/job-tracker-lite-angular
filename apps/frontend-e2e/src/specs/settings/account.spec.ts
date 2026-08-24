import { test, expect } from '../../support/fixtures/e2e.fixtures';
import {
  extractLink,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';
import { signInThroughUi } from '../../support/helpers/auth.helper';
import { provisionUser } from '../../support/helpers/api.helper';

test.describe('account settings', { tag: '@full-stack-only' }, () => {
  // Signs in as an account it owns outright. Confirming an email change
  // rewrites user.email and deletes every session row for that user
  // (AccountService.verifyEmailChange), so running this against the
  // worker-scoped user invalidated the storageState the worker fixture hands
  // to every later test on that worker - they started unauthenticated and
  // failed on unrelated locator timeouts, depending on scheduling.
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
    await signInThroughUi(page, newEmail, owner.password);
  });

  // These provision their own account for a second reason on top of the one
  // above: a request that succeeds starts the resend cooldown, which disables
  // the submit button on any later test sharing the account.
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
