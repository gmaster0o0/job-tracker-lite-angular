import { ComponentHarness } from '@angular/cdk/testing';

export class EditButtonHarness extends ComponentHarness {
  static hostSelector = 'app-edit-button';

  private readonly getButton = this.locatorFor('button[type="button"]');

  async click(): Promise<void> {
    const button = await this.getButton();
    await button.click();
  }

  async getLabelText(): Promise<string> {
    const button = await this.getButton();
    return button.text();
  }

  async isDisabled(): Promise<boolean> {
    const button = await this.getButton();
    return button.getProperty('disabled');
  }
}
