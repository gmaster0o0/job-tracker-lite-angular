import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Job CRUD', () => {
  test('create job appears in list', async ({ page }) => {
    await page.goto('/jobs');

    await page.getByTestId('create-job-btn').click();
    await page.getByTestId('position-input').fill('Test Position');
    await page.getByTestId('company-input').fill('Test Company');
    await page.getByTestId('submit-btn').click();

    await expect(
      page.getByTestId('job-position').filter({ hasText: 'Test Position' }),
    ).toBeVisible();
  });

  test('edit job values persist', async ({ page }) => {
    await page.goto('/jobs');

    const uniqueEditTitle = `To Edit ${Date.now()}`;
    await page.getByTestId('create-job-btn').click();
    await page.getByTestId('position-input').fill(uniqueEditTitle);
    await page.getByTestId('company-input').fill('Test Edit Company');
    await page.getByTestId('save-job-btn').click();

    const specificCard = page
      .getByTestId('job-card')
      .filter({ hasText: uniqueEditTitle });
    await expect(specificCard).toBeVisible();

    await specificCard.getByTestId('edit-job-btn').click();

    const finalEditTitle = `Edited ${Date.now()}`;
    await page.getByTestId('position-input').fill(finalEditTitle);
    await page.getByTestId('save-job-btn').click();

    await page.reload();

    await expect(
      page.getByTestId('job-position').filter({ hasText: finalEditTitle }),
    ).toBeVisible();
  });

  test('delete job with confirm dialog', async ({ page }) => {
    await page.goto('/jobs');

    // Wait for the list to load and become stable
    const cards = page.getByTestId('job-card');
    await expect(cards.first()).toBeVisible();

    // We cannot use await count() effectively since there could be rendering updates
    // But since we want to verify deletion, we will use a specific title.
    const uniqueTitle = `To Delete ${Date.now()}`;
    await page.getByTestId('create-job-btn').click();
    await page.getByTestId('position-input').fill(uniqueTitle);
    await page.getByTestId('company-input').fill('Test Company');
    await page.getByTestId('save-job-btn').click();

    // Wait for it to appear
    const specificCard = page
      .getByTestId('job-card')
      .filter({ hasText: uniqueTitle });
    await expect(specificCard).toBeVisible();

    await specificCard.getByTestId('delete-job-btn').click();
    await page.getByTestId('confirm-delete-btn').click();

    // Verify it is gone
    await expect(specificCard).toBeHidden();
  });
});
