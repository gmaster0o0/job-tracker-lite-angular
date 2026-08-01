import { test, expect } from '../../support/fixtures/e2e.fixtures';

// Only the presence check survives here. The edit/save and cancel tests that
// used to live in this file drove a single free-text `core-skills-input`,
// which the app does not have - skills are added and removed one at a time
// (add-new-skill-btn / save-skills-btn / discard-skills-btn). Covering that
// flow needs a spec written against the real control, not renamed selectors.
test.describe('Profile - Skills', () => {
  test('should display skills section', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByTestId('skills-section')).toBeVisible();
  });
});
