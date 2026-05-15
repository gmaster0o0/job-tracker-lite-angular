import { ComponentHarness } from '@angular/cdk/testing';
import { CreateJobDto } from '@job-tracker-lite-angular/schemas';

export class CreateJobHarness extends ComponentHarness {
  static hostSelector = 'app-create-job';

  private readonly getPositionInput = this.locatorFor(
    '[formControlName="position"]',
  );
  private readonly getCompanyInput = this.locatorFor(
    '[formControlName="company"]',
  );
  private readonly getLinkInput = this.locatorFor('[formControlName="link"]');
  private readonly getDescriptionInput = this.locatorFor(
    '[formControlName="description"]',
  );
  private readonly getSubmitButton = this.locatorFor(
    'app-save-button button[type="submit"]',
  );
  private readonly getErrorMessage =
    this.locatorForOptional('.text-destructive');

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
      if (values.link.length > 0) {
        await input.sendKeys(values.link);
      }
      await input.dispatchEvent('input');
    }

    if (values.description !== undefined) {
      const input = await this.getDescriptionInput();
      await input.clear();
      if (values.description.length > 0) {
        await input.sendKeys(values.description);
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

  async getSubmitErrorText(): Promise<string | null> {
    const error = await this.getErrorMessage();
    return error ? error.text() : null;
  }
}
