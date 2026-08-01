import type { Page } from '@playwright/test';
import { test, expect } from '../../support/fixtures/e2e.fixtures';

// The create/edit/delete controls live on the job detail view - edit and
// delete behind the "More options" menu - so each test opens a job first.
// The dialog fields are plain inputs carrying ids, not test ids.
const openFirstJob = async (page: Page) => {
  await page.goto('/jobs');
  await page.getByTestId('job-card').first().click();
  await expect(page.getByTestId('job-title')).toBeVisible();
};

test.describe('Job CRUD', () => {
  test('create job appears in list', async ({ page }) => {
    await openFirstJob(page);

    await page.getByTestId('create-job-btn').click();
    await page.locator('#position').fill('Test Position');
    await page.locator('#company').fill('Test Company');
    await page.getByTestId('submit-btn').click();

    await expect(
      page.getByTestId('job-card').filter({ hasText: 'Test Position' }),
    ).toBeVisible();
  });

  test('edit job values persist', async ({ page }) => {
    await openFirstJob(page);

    const edited = `Edited ${Date.now()}`;
    await page.getByTestId('job-actions-btn').click();
    await page.getByTestId('edit-job-btn').click();
    await page.locator('#position').fill(edited);
    await page.getByTestId('submit-btn').click();

    await expect(page.getByTestId('job-title')).toHaveText(edited);
    await expect(
      page.getByTestId('job-card').filter({ hasText: edited }),
    ).toBeVisible();
  });

  test('delete job with confirm dialog', async ({ page }) => {
    await openFirstJob(page);

    const title = await page.getByTestId('job-title').innerText();

    await page.getByTestId('job-actions-btn').click();
    await page.getByTestId('delete-job-btn').click();
    await page.getByTestId('confirm-btn').click();

    await expect(
      page.getByTestId('job-card').filter({ hasText: title }),
    ).toHaveCount(0);
  });
});
