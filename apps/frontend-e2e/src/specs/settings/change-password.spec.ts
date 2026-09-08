import type { Page } from '@playwright/test';
import { test, expect } from '../../support/fixtures/e2e.fixtures';
import { provisionUser } from '../../support/helpers/api.helper';
import { signInThroughUi } from '../../support/helpers/auth.helper';

// Own accounts throughout: a successful change signs the session out.
// ADR-0004, "Operating rules".
test.describe('change password', { tag: '@full-stack-only' }, () => {
  test.use({ storageState: undefined });

  const fillChangePassword = async (
    page: Page,
    currentPassword: string,
    newPassword: string,
  ) => {
    await page.goto('/settings/account');
    await expect(page.locator('#changePasswordForm')).toBeVisible();

    await page.locator('#currentPassword').fill(currentPassword);
    await page.locator('#newPassword').fill(newPassword);
    await page
      .locator('#changePasswordForm #confirmPassword')
      .fill(newPassword);
    // Disambiguates from the change-email form's button on the same page.
    await page.locator('button[form="changePasswordForm"]').click();
  };

  test('changing the password signs the session out and the new one works', async ({
    page,
    request,
    baseURL,
  }) => {
    const user = await provisionUser(
      request,
      `pwd_${Date.now()}`,
      baseURL ?? undefined,
    );
    const newPassword = 'BrandNewPassword123!';

    await signInThroughUi(page, user.email, user.password);
    await fillChangePassword(page, user.password, newPassword);

    // The app logs the user out after a password change, so the proof the
    // change took effect is that only the new password gets back in.
    await expect(page).toHaveURL(/\/auth\/login/);
    await signInThroughUi(page, user.email, newPassword);
  });

  test('rejects a wrong current password', async ({
    page,
    request,
    baseURL,
  }) => {
    const user = await provisionUser(
      request,
      `pwd_wrong_${Date.now()}`,
      baseURL ?? undefined,
    );

    await signInThroughUi(page, user.email, user.password);
    await fillChangePassword(page, 'NotTheCurrentPassword123!', 'Whatever123!');

    await expect(page.getByText('Password Update Failed')).toBeVisible();
    await expect(
      page.getByText('Your current password is incorrect.'),
    ).toBeVisible();

    // The session survives a rejected change - the user is still on settings.
    await expect(page).toHaveURL(/\/settings\/account/);
  });
});
