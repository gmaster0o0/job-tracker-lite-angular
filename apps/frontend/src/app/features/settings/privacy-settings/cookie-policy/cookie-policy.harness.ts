import { ComponentHarness } from '@angular/cdk/testing';

export class CookiePolicyHarness extends ComponentHarness {
  static hostSelector = 'app-cookie-policy';

  private getOpenButton = this.locatorFor('button[hlmBtn]');

  private getDialogContent =
    this.documentRootLocatorFactory().locatorFor('hlm-dialog-content');

  async clickOpenButton(): Promise<void> {
    const btn = await this.getOpenButton();
    await btn.click();
  }

  async isDialogVisible(): Promise<boolean> {
    try {
      await this.getDialogContent();
      return true;
    } catch {
      return false;
    }
  }
}
