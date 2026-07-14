import { ComponentHarness } from '@angular/cdk/testing';

export class ConfirmationDialogHarness extends ComponentHarness {
  static hostSelector = 'app-confirmation-dialog';

  protected getValueInput = this.locatorForOptional('input#confirmationValue');
  protected getSubmitButton = this.locatorFor('button[type="submit"]');
  protected getCancelButton = this.locatorFor('button[hlmDialogClose]');

  /** True, ha a dialog egy "gépeld be a megerősítéshez" mezővel rendelkezik. */
  async hasField(): Promise<boolean> {
    return (await this.getValueInput()) !== null;
  }

  async setValue(value: string): Promise<void> {
    const input = await this.getValueInput();
    if (!input) {
      throw new Error(
        'Ehhez a confirmation dialoghoz nincs konfigurálva input mező.',
      );
    }
    await input.clear();
    await input.sendKeys(value);
    await input.blur();
  }

  async clickSubmit(): Promise<void> {
    const button = await this.getSubmitButton();
    await button.click();
  }

  async clickCancel(): Promise<void> {
    const button = await this.getCancelButton();
    await button.click();
  }

  async isSubmitDisabled(): Promise<boolean> {
    const button = await this.getSubmitButton();
    return await button.getProperty('disabled');
  }
}
