import { test, expect } from '../../support/fixtures/e2e.fixtures';

// Presence only. Skills are added and removed one at a time
// (add-new-skill-btn / save-skills-btn / discard-skills-btn); covering that
// flow needs a spec written against those controls.
test.describe('Profile - Skills', () => {
  test('should display skills section', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByTestId('skills-section')).toBeVisible();
  });
});
