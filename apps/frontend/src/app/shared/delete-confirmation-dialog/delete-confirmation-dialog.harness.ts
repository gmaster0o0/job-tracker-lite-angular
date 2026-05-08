import { ComponentHarness } from '@angular/cdk/testing';

export class DeleteConfirmationDialogHarness extends ComponentHarness {
  static hostSelector = 'app-delete-confirmation-dialog';

  private readonly getButtons = this.locatorForAll('button');

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }

  async clickConfirm(): Promise<void> {
    const buttons = await this.getButtons();
    await buttons[1].click();
  }

  async isConfirmDisabled(): Promise<boolean> {
    const buttons = await this.getButtons();
    return buttons[1].getProperty('disabled');
  }

  async getConfirmLabelText(): Promise<string> {
    const buttons = await this.getButtons();
    return buttons[1].text();
  }
}
