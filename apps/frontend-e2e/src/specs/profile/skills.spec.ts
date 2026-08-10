import { test, expect } from '../../support/fixtures/e2e.fixtures';

// Skills are added and removed one at a time (add-new-skill-btn /
// save-skills-btn / discard-skills-btn), not through a single free-text
// input, so each addition path below drives the real combobox control.
test.describe('Profile - Skills', () => {
  test('should display skills section', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByTestId('skills-section')).toBeVisible();
  });

  test('adding a skill from the suggestion list persists it', async ({
    page,
  }) => {
    await page.goto('/profile');
    const skillsSection = page.getByTestId('skills-section');
    await expect(skillsSection).toBeVisible();

    // Neither fixture's coreSkills include this one, so it's unambiguous
    // whether it came from the suggestion list or was already there.
    await page.locator('#newSkill').fill('JavaScript');
    await page.getByRole('button', { name: 'JavaScript', exact: true }).click();
    await page.getByTestId('save-skills-btn').click();

    await page.reload();
    await expect(skillsSection.getByText('JavaScript')).toBeVisible();
  });

  test('adding a new skill not in the list persists it', async ({ page }) => {
    await page.goto('/profile');
    const skillsSection = page.getByTestId('skills-section');
    await expect(skillsSection).toBeVisible();

    const customSkill = `Quantum Debugging ${Date.now()}`;
    await page.locator('#newSkill').fill(customSkill);
    await page.getByTestId('add-new-skill-btn').click();
    await page.getByTestId('save-skills-btn').click();

    await page.reload();
    await expect(skillsSection.getByText(customSkill)).toBeVisible();
  });
});
