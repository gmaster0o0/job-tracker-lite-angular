import { ComponentHarness } from '@angular/cdk/testing';

export class EditJobDialogFooterHarness extends ComponentHarness {
  static hostSelector = 'app-edit-job-dialog-footer';

  private readonly getButtons = this.locatorForAll('button');

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }

  async isSubmitDisabled(): Promise<boolean> {
    const buttons = await this.getButtons();
    return buttons[1].getProperty('disabled');
  }
}
