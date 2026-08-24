import type { Page } from '@playwright/test';
import { test, expect } from '../../support/fixtures/e2e.fixtures';
import { authSessionFixtures } from '@job-tracker-lite-angular/testing';
import { provisionUser } from '../../support/helpers/api.helper';
import { signInThroughUi } from '../../support/helpers/auth.helper';
import {
  extractLink,
  waitForEmail,
} from '../../support/helpers/mailpit.helper';

// Every section on the privacy page is an accordion panel, collapsed on
// load, so each test opens the one it needs first.
const openSection = async (page: Page, section: string) => {
  await page.goto('/settings/privacy');
  await page.getByTestId(`privacy-section-${section}`).click();
};

test.describe('privacy - data management', () => {
  test('exports the account data as a JSON download', async ({ page }) => {
    // Headroom, kept deliberately. This timed out twice in CI waiting for the
    // accordion trigger, which is what /settings/privacy looks like when the
    // session is gone and the router has bounced to /auth/login - the
    // account spec was destroying the worker user's sessions at the time, so
    // that is the likely cause and it is fixed. Left in until a few runs
    // confirm it, rather than assuming.
    test.slow();

    await openSection(page, 'data-management');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-data-btn').click(),
    ]);

    // The name is built client-side from the signed-in user, so assert its
    // shape rather than an exact string that differs per lane.
    expect(download.suggestedFilename()).toMatch(/^jobtracker-.+\.json$/);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    // Proves the download carries the export payload, not an error page.
    expect(() =>
      JSON.parse(Buffer.concat(chunks).toString('utf-8')),
    ).not.toThrow();
  });

  // Full-stack would wipe the worker user's seeded jobs, which every other
  // job spec in that worker depends on.
  test.describe('bulk delete', { tag: '@mock-only' }, () => {
    test('deleting the stored applications empties the list', async ({
      page,
    }) => {
      await openSection(page, 'data-management');

      // The slider defaults to a six-month cutoff; submitting it opens the
      // confirmation dialog, which requires the account's own address.
      await page.getByTestId('cleanup-period-submit').click();
      await page
        .locator('#confirmationValue')
        .fill(authSessionFixtures.authenticated!.user.email);
      await page.locator('button[form="confirmationForm"]').click();

      await page.goto('/jobs');
      await expect(page.getByTestId('empty-state')).toBeVisible();
    });
  });
});

test.describe('privacy - account deletion', () => {
  test.describe('request', { tag: '@mock-only' }, () => {
    test('asks for email confirmation instead of deleting immediately', async ({
      page,
    }) => {
      await openSection(page, 'danger-zone');

      await page.getByTestId('delete-account-btn').click();
      await page.getByTestId('confirm-btn').click();

      await expect(
        page.getByTestId('delete-account-confirmation-sent'),
      ).toBeVisible();
    });

    test.describe('server error', () => {
      test.use({ scenarios: { account: 'serverError' } });

      test('surfaces the failure and sends no confirmation', async ({
        page,
      }) => {
        await openSection(page, 'danger-zone');

        await page.getByTestId('delete-account-btn').click();
        await page.getByTestId('confirm-btn').click();

        await expect(
          page.getByText('Account Deletion Request Failed'),
        ).toBeVisible();
        await expect(
          page.getByTestId('delete-account-confirmation-sent'),
        ).toHaveCount(0);
      });
    });
  });

  test.describe('pending deletion', { tag: '@mock-only' }, () => {
    test.use({ scenarios: { account: 'deletionPending' } });

    test('counts down the grace period and recovers the account', async ({
      page,
    }) => {
      await page.goto('/privacy/delete-pending');

      await expect(page.getByText('Account Deletion Is Pending')).toBeVisible();
      // The grace period is seven days out, so the countdown starts at 6d
      // with the remaining hours rounded down.
      await expect(page.getByText(/\dd \d+h \d+m/)).toBeVisible();

      await page.getByTestId('recover-account-btn').click();
      await page.getByTestId('confirm-btn').click();

      // Recovering clears the pending status, so authGuard now lets the
      // privacy page load instead of bouncing back here.
      await expect(page).toHaveURL(
        /\/settings\/privacy\?accountDeletion=recovered/,
      );
    });
  });

  test.describe('end to end', { tag: '@full-stack-only' }, () => {
    // This test signs in as its own account, and every /auth/* route sits
    // behind guestGuard - carrying the worker user's storageState would
    // redirect the sign-in away from the login form before it could be filled.
    test.use({ storageState: undefined });

    test('request → confirm from Mailpit → sign back in → recover', async ({
      page,
      request,
      baseURL,
    }) => {
      // Its own account: confirming the request marks the user for deletion and
      // drops every session it has, which would strand the worker user.
      const user = await provisionUser(
        request,
        `del_${Date.now()}`,
        baseURL ?? undefined,
      );

      await signInThroughUi(page, user.email, user.password);
      await openSection(page, 'danger-zone');

      await page.getByTestId('delete-account-btn').click();
      await page.getByTestId('confirm-btn').click();
      await expect(
        page.getByTestId('delete-account-confirmation-sent'),
      ).toBeVisible();

      const email = await waitForEmail(
        request,
        user.email,
        /Confirm your account deletion/i,
      );
      const confirmLink = extractLink(
        email.HTML,
        '/api/account/confirm-delete',
      );
      expect(confirmLink).toBeTruthy();

      await page.goto(confirmLink!);

      // Confirming wipes the user's sessions, so getting back in is part of the
      // flow - and a pending account lands on the deletion page, not on /jobs.
      await signInThroughUi(page, user.email, user.password);
      await expect(page).toHaveURL(/\/privacy\/delete-pending/);
      await expect(page.getByText('Account Deletion Is Pending')).toBeVisible();

      await page.getByTestId('recover-account-btn').click();
      await page.getByTestId('confirm-btn').click();

      await expect(page).toHaveURL(/\/settings\/privacy/);
    });
  });
});
