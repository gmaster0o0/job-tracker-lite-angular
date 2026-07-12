import { ComponentHarness } from '@angular/cdk/testing';

export class PrivacyPolicyHarness extends ComponentHarness {
  static hostSelector = 'app-privacy-policy';

  private getOpenButton = this.locatorFor(
    'button[data-testid="privacy-policy-trigger"]',
  );

  private getDialogContent =
    this.documentRootLocatorFactory().locatorFor('hlm-dialog-content');

  private getCloseButton = this.documentRootLocatorFactory().locatorFor(
    'button[data-testid="privacy-policy-close"]',
  );

  async clickOpenButton(): Promise<void> {
    const btn = await this.getOpenButton();
    await btn.click();
  }

  async close(): Promise<void> {
    const btn = await this.getCloseButton();
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
