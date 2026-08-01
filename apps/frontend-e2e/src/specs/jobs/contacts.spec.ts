import { test, expect } from '../../support/fixtures/e2e.fixtures';

test.describe('Job Contacts CRUD', () => {
  test('list, create, edit, delete contact', async ({ page }) => {
    await page.goto('/jobs');

    // 1. Create a Job to act as parent for the contacts
    const uniqueJobTitle = `Contact Job ${Date.now()}`;
    await page.getByTestId('create-job-btn').click();
    await page.getByTestId('position-input').fill(uniqueJobTitle);
    await page.getByTestId('company-input').fill('Test Contact Company');
    await page.getByTestId('save-job-btn').click();

    // 2. Select the created Job to go to details view
    const specificCard = page
      .getByTestId('job-card')
      .filter({ hasText: uniqueJobTitle });
    await expect(specificCard).toBeVisible();
    await specificCard.click();

    // 3. Switch to Contacts Tab
    await page.getByRole('tab', { name: /contacts/i }).click();

    // 4. Create a new Contact
    await page.getByTestId('add-contact-btn').click();
    await page.getByTestId('contact-name-input').fill('John Doe');
    await page.getByTestId('contact-email-input').fill('john@example.com');
    await page.getByTestId('contact-phone-input').fill('+1 555 123 4567');
    await page.getByTestId('submit-btn').click();

    // 5. Verify the Contact appears in the list
    const contactCard = page
      .getByTestId('contact-card')
      .filter({ hasText: 'John Doe' });
    await expect(contactCard).toBeVisible();
    await expect(contactCard.getByTestId('contact-email')).toContainText(
      'john@example.com',
    );
    await expect(contactCard.getByTestId('contact-phone')).toContainText(
      '+1 555 123 4567',
    );

    // 6. Edit the Contact
    await contactCard.getByTestId('edit-contact-btn').click();
    await page.getByTestId('contact-name-input').fill('Jane Doe');
    await page.getByTestId('submit-btn').click();

    // 7. Verify the Edit succeeded
    const updatedContactCard = page
      .getByTestId('contact-card')
      .filter({ hasText: 'Jane Doe' });
    await expect(updatedContactCard).toBeVisible();
    // Verify old contact name is gone
    await expect(contactCard).not.toBeVisible();

    // 8. Delete the Contact
    await updatedContactCard.getByTestId('delete-contact-btn').click();

    // Confirm Deletion in Dialog
    const confirmDeleteBtn = page.getByRole('button', {
      name: /delete contact/i,
    });
    await expect(confirmDeleteBtn).toBeVisible();
    await confirmDeleteBtn.click();

    // 9. Verify Deletion succeeded
    await expect(updatedContactCard).not.toBeVisible();
  });
});
