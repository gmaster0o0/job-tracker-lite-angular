import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Job Status', () => {
  test('change status updates badge', async ({ page }) => {
    await page.goto('/jobs');

    const uniqueEditTitle = `Status Change Test ${Date.now()}`;
    await page.getByTestId('create-job-btn').click();
    await page.getByTestId('position-input').fill(uniqueEditTitle);
    await page.getByTestId('company-input').fill('Test Company');
    // Using default status SAVED
    await page.getByTestId('save-job-btn').click();

    const specificCard = page
      .getByTestId('job-card')
      .filter({ hasText: uniqueEditTitle });
    await expect(specificCard).toBeVisible();
    await expect(specificCard.getByTestId('status-badge')).toContainText(
      'Saved',
      { ignoreCase: true },
    );

    await specificCard.getByTestId('change-status-btn').click();
    await page.getByTestId('status-option-APPLIED').click();

    await expect(specificCard.getByTestId('status-badge')).toContainText(
      'APPLIED',
      { ignoreCase: true },
    );
  });
});
