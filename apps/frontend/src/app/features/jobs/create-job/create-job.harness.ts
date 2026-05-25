import { ComponentHarness } from '@angular/cdk/testing';
import { CreateJobDto } from '@job-tracker-lite-angular/schemas';

export class CreateJobHarness extends ComponentHarness {
  static hostSelector = 'app-create-job';

  private readonly getPositionInput = this.locatorFor('#position');
  private readonly getCompanyInput = this.locatorFor('#company');
  private readonly getLinkInput = this.locatorFor('#link');
  private readonly getDescriptionInput = this.locatorFor('#description');
  private readonly getSubmitButton = this.locatorFor(
    'app-create-job-dialog-footer button[type="submit"]',
  );
  private readonly getErrorMessageTitle =
    this.locatorForOptional('[hlmAlertTitle]');

  async fillForm(values: Partial<CreateJobDto>): Promise<void> {
    if (values.position !== undefined) {
      const input = await this.getPositionInput();
      await input.clear();
      if (values.position.length > 0) {
        await input.sendKeys(values.position);
      }
      await input.dispatchEvent('input');
    }

    if (values.company !== undefined) {
      const input = await this.getCompanyInput();
      await input.clear();
      if (values.company.length > 0) {
        await input.sendKeys(values.company);
      }
      await input.dispatchEvent('input');
    }

    if (values.link !== undefined) {
      const input = await this.getLinkInput();
      await input.clear();
      const link = values.link ?? '';
      if (typeof link === 'string' && link) {
        await input.sendKeys(link);
      }
      await input.dispatchEvent('input');
    }

    if (values.description !== undefined) {
      const input = await this.getDescriptionInput();
      await input.clear();
      const description = values.description ?? '';
      if (typeof description === 'string' && description) {
        await input.sendKeys(description);
      }
      await input.dispatchEvent('input');
    }
  }

  async submit(): Promise<void> {
    const button = await this.getSubmitButton();
    await button.click();
  }

  async isSubmitDisabled(): Promise<boolean> {
    const button = await this.getSubmitButton();
    return button.getProperty('disabled');
  }

  async getSubmitErrorTitle(): Promise<string | null> {
    const error = await this.getErrorMessageTitle();
    return error ? error.text() : null;
  }
}
