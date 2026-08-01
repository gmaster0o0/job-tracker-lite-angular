import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Profile - Personal Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('should display personal info', async ({ page }) => {
    await expect(page.getByTestId('personal-info-section')).toBeVisible();
  });

  test('should edit and save personal info', async ({ page }) => {
    await page
      .getByTestId('personal-info-section')
      .getByTestId('edit-btn')
      .click();

    await page.getByTestId('name-input').fill('Alice Updated');
    await page.getByTestId('title-input').fill('Lead Developer');
    await page.getByTestId('city-input').fill('Remote');
    await page.getByTestId('bio-input').fill('Testing the bio update.');

    await page.getByTestId('save-btn').click();

    await expect(page.getByTestId('personal-info-section')).toContainText(
      'Alice Updated',
    );
    await expect(page.getByTestId('personal-info-section')).toContainText(
      'Lead Developer',
    );
  });

  test('should cancel editing personal info', async ({ page }) => {
    await page
      .getByTestId('personal-info-section')
      .getByTestId('edit-btn')
      .click();
    await page.getByTestId('name-input').fill('Cancel Me');
    await page.getByTestId('cancel-btn').click();

    await expect(page.getByTestId('name-input')).toBeHidden();
    await expect(page.getByTestId('personal-info-section')).not.toContainText(
      'Cancel Me',
    );
  });
});
