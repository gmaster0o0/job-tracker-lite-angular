import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Profile - Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('should display visibility section', async ({ page }) => {
    await expect(page.getByTestId('visibility-section')).toBeVisible();
  });

  test('should edit and save visibility settings', async ({ page }) => {
    await page
      .getByTestId('visibility-section')
      .getByTestId('edit-btn')
      .click();

    // Assuming a standard select or radio component can be interacted with
    await page.getByTestId('personal-visibility-select').click();
    await page.getByTestId('visibility-option-public').click();

    await page.getByTestId('contact-visibility-select').click();
    await page.getByTestId('visibility-option-connections').click();

    await page.getByTestId('save-btn').click();

    await expect(page.getByTestId('visibility-section')).toContainText(
      'Public',
    );
  });

  test('should cancel visibility edits', async ({ page }) => {
    await page
      .getByTestId('visibility-section')
      .getByTestId('edit-btn')
      .click();

    await page.getByTestId('personal-visibility-select').click();
    await page.getByTestId('visibility-option-private').click();

    await page.getByTestId('cancel-btn').click();

    await expect(page.getByTestId('personal-visibility-select')).toBeHidden();
  });
});
