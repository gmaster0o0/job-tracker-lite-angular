import { ComponentHarness } from '@angular/cdk/testing';

export class CreateJobDialogFooterHarness extends ComponentHarness {
  static hostSelector = 'app-create-job-dialog-footer';

  private readonly getButtons = this.locatorForAll('button');

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }

  async isSubmitDisabled(): Promise<boolean> {
    const buttons = await this.getButtons();
    return buttons[1].getProperty('disabled');
  }

  async getSubmitLabelText(): Promise<string> {
    const buttons = await this.getButtons();
    return buttons[1].text();
  }
}
