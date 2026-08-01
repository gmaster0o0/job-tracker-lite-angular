import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Job Status', () => {
  test('change status updates badge', async ({ page }) => {
    await page.goto('/jobs');

    // Status lives on the detail view, not the card: open a job first.
    await page.getByTestId('job-card').first().click();
    await expect(page.getByTestId('job-title')).toBeVisible();

    // Status is advanced through the progression stepper. Step 2 is Applied.
    await page.getByTestId('stepper-step').nth(1).click();

    await expect(page.getByTestId('job-status-badge')).toContainText(
      'Applied',
      { ignoreCase: true },
    );
  });
});
