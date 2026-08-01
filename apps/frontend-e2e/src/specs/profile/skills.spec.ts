import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Profile - Skills', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('should display skills section', async ({ page }) => {
    await expect(page.getByTestId('skills-section')).toBeVisible();
  });

  test('should edit and save core skills', async ({ page }) => {
    await page.getByTestId('skills-section').getByTestId('edit-btn').click();

    await page
      .getByTestId('core-skills-input')
      .fill('Playwright, Angular, E2E');

    await page.getByTestId('save-btn').click();

    await expect(page.getByTestId('skills-section')).toContainText(
      'Playwright',
    );
    await expect(page.getByTestId('skills-section')).toContainText('Angular');
  });

  test('should cancel editing skills', async ({ page }) => {
    await page.getByTestId('skills-section').getByTestId('edit-btn').click();
    await page.getByTestId('core-skills-input').fill('Should Not Save');
    await page.getByTestId('cancel-btn').click();

    await expect(page.getByTestId('core-skills-input')).toBeHidden();
    await expect(page.getByTestId('skills-section')).not.toContainText(
      'Should Not Save',
    );
  });
});
