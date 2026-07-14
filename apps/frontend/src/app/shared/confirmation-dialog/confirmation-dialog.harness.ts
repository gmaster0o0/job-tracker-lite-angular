import { ComponentHarness } from '@angular/cdk/testing';

export class ConfirmationDialogHarness extends ComponentHarness {
  static hostSelector = 'app-confirmation-dialog';

  private getValueInput = this.locatorForOptional('input#confirmationValue');
  private getSubmitButton = this.locatorFor('button[type="submit"]');
  private getCancelButton = this.locatorFor('app-cancel-button button');
  private getTitle = this.locatorFor('[hlmAlertDialogTitle]');
  private getDescription = this.locatorFor('[hlmAlertDialogDescription]');
  private getFieldError = this.locatorForOptional('hlm-field-error');

  async hasField(): Promise<boolean> {
    return (await this.getValueInput()) !== null;
  }

  async getTitleText(): Promise<string> {
    return (await this.getTitle()).text();
  }
  async getDescriptionText(): Promise<string> {
    return (await this.getDescription()).text();
  }
  async setValue(value: string): Promise<void> {
    const input = await this.getValueInput();
    if (!input) throw new Error('Input field not found.');
    await input.setInputValue(value);
    await input.blur();
  }

  async clickSubmit(): Promise<void> {
    await (await this.getSubmitButton()).click();
  }

  async clickCancel(): Promise<void> {
    await (await this.getCancelButton()).click();
  }

  async isSubmitDisabled(): Promise<boolean> {
    return await (await this.getSubmitButton()).getProperty('disabled');
  }

  async getSubmitButtonText(): Promise<string> {
    const button = await this.getSubmitButton();
    return (await button.text()).trim();
  }

  async getErrorMessage(): Promise<string | null> {
    const error = await this.getFieldError();
    return error ? await error.text() : null;
  }
}
