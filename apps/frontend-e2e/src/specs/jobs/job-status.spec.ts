import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Job Status', () => {
  test('change status updates badge', async ({ page }) => {
    await page.goto('/jobs');

    // Status lives on the detail view, not the card.
    await page.getByTestId('job-card').first().click();
    await expect(page.getByTestId('job-title')).toBeVisible();

    // Step 2 of the progression stepper is Applied.
    await page.getByTestId('stepper-step').nth(1).click();

    await expect(page.getByTestId('job-status-badge')).toContainText(
      'Applied',
      { ignoreCase: true },
    );
  });
});
