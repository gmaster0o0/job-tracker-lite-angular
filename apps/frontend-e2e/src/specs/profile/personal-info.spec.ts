import { test, expect } from '../../support/fixtures/e2e.fixtures';

// The fields are app-inline-input components. Their `id` lands on the host
// element, not the control, so the input itself is addressed as `#name input`.
const field = (name: string) => `#${name} input`;

test.describe('Profile - Personal Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('should display personal info', async ({ page }) => {
    await expect(page.getByTestId('personal-info-section')).toBeVisible();
  });

  test('should edit and save personal info', async ({ page }) => {
    const section = page.getByTestId('personal-info-section');
    await section.getByTestId('edit-btn').click();

    await page.locator(field('name')).fill('Alice Updated');
    await page.locator(field('title')).fill('Lead Developer');
    await page.locator(field('city')).fill('Remote');
    // bio is an app-inline-textarea, not an inline-input
    await page.locator('#bio textarea').fill('Testing the bio update.');

    await section.getByTestId('submit-btn').click();

    await expect(page.locator(field('name'))).toHaveValue('Alice Updated');
    await expect(page.locator(field('title'))).toHaveValue('Lead Developer');
  });

  test('should cancel editing personal info', async ({ page }) => {
    const section = page.getByTestId('personal-info-section');
    const original = await page.locator(field('name')).inputValue();

    await section.getByTestId('edit-btn').click();
    await page.locator(field('name')).fill('Cancel Me');
    await section.getByTestId('cancel-btn').click();

    // The inputs stay mounted and go read-only rather than unmounting, so the
    // assertion is that the edit was discarded and the card left edit mode.
    await expect(page.locator(field('name'))).toHaveValue(original);
    await expect(section.getByTestId('edit-btn')).toBeVisible();
  });
});
