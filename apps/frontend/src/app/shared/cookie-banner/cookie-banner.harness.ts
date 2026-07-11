import { ComponentHarness } from '@angular/cdk/testing';

export class CookieBannerHarness extends ComponentHarness {
  static hostSelector = 'app-cookie-banner';

  private readonly getButtons = this.locatorForAll('button');

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }

  async clickAcceptButton(): Promise<void> {
    const buttons = await this.getButtons();
    await buttons[2].click();
  }

  async clickDeclineButton(): Promise<void> {
    const buttons = await this.getButtons();
    await buttons[1].click();
  }

  async clickSettingsButton(): Promise<void> {
    const buttons = await this.getButtons();
    await buttons[0].click();
  }
}
