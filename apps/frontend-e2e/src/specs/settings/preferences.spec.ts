import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('User Preferences', () => {
  test('should load and update preferences', async ({ page }) => {
    await page.goto('/settings/preferences');

    await expect(
      page.getByRole('heading', { name: 'Preferences' }),
    ).toBeVisible();

    await page.getByLabel('Theme').selectOption('Dark Mode');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(
      page.getByText('Preferences updated successfully'),
    ).toBeVisible();
  });
});
