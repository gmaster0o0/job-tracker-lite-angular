import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Job Notes', () => {
  test('should display job notes and add a new note', async ({ page }) => {
    await page.goto('/jobs/1/notes');

    await expect(page.getByRole('heading', { name: 'Notes' })).toBeVisible();

    await page
      .getByPlaceholder('Add a new note...')
      .fill('Follow up post interview.');
    await page.getByRole('button', { name: 'Save Note' }).click();

    await expect(page.getByText('Follow up post interview.')).toBeVisible();
  });
});
