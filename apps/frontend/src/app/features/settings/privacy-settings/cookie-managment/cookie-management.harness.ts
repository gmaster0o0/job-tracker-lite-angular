import { ComponentHarness } from '@angular/cdk/testing';

export class CookieManagementHarness extends ComponentHarness {
  static hostSelector = 'app-cookie-management';

  private readonly getSettingsButton = this.locatorFor('button');

  async clickOpenSettings(): Promise<void> {
    const button = await this.getSettingsButton();
    await button.click();
  }
}
