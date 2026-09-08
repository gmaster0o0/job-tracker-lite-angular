import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Job Status', () => {
  test('change status updates badge', async ({ page }) => {
    await page.goto('/jobs');

    // Status lives on the detail view, not the card: open a job first.
    const firstCard = page.getByTestId('job-card').first();
    await firstCard.click();
    await expect(page.getByTestId('job-title')).toBeVisible();
    const title = await page.getByTestId('job-title').innerText();

    // Status is advanced through the progression stepper. Step 2 is Applied.
    await page.getByTestId('stepper-step').nth(1).click();

    await expect(page.getByTestId('job-status-badge')).toContainText(
      'Applied',
      { ignoreCase: true },
    );

    // The navigation panel's job list renders the same job as its own card,
    // fed by the shared jobs resource - the status change must show up there
    // too, not just in the detail view's local state.
    const listEntry = page.getByTestId('job-card').filter({ hasText: title });
    await expect(listEntry.getByTestId('job-card-status-badge')).toContainText(
      'Applied',
      { ignoreCase: true },
    );
  });
});
