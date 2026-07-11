import { ComponentHarness } from '@angular/cdk/testing';

export class CookieConsentManagerHarness extends ComponentHarness {
  static hostSelector = 'app-cookie-consent-manager';

  private readonly getEssentialSwitch = this.locatorFor('#cookie-essential');
  private readonly getStatisticalSwitch = this.locatorFor(
    '#cookie-statistical',
  );
  private readonly getMarketingSwitch = this.locatorFor('#cookie-marketing');
  private readonly getPreferencesSwitch = this.locatorFor(
    '#cookie-preferences',
  );

  private readonly getSaveButton = this.locatorFor(
    'hlm-dialog-footer button:not([variant="outline"])',
  );
  private readonly getCancelButton = this.locatorFor(
    'hlm-dialog-footer button[variant="outline"]',
  );

  async isEssentialChecked(): Promise<boolean> {
    const el = await this.getEssentialSwitch();
    return (await el.getAttribute('data-checked')) !== null;
  }

  async isEssentialDisabled(): Promise<boolean> {
    const el = await this.getEssentialSwitch();
    return (await el.getAttribute('data-disabled')) === 'true';
  }

  async isStatisticalChecked(): Promise<boolean> {
    const el = await this.getStatisticalSwitch();
    return (await el.getAttribute('data-checked')) !== null;
  }

  async isStatisticalDisabled(): Promise<boolean> {
    const el = await this.getStatisticalSwitch();
    return (await el.getAttribute('data-disabled')) === 'true';
  }

  async isMarketingChecked(): Promise<boolean> {
    const el = await this.getMarketingSwitch();
    return (await el.getAttribute('data-checked')) !== null;
  }

  async isMarketingDisabled(): Promise<boolean> {
    const el = await this.getMarketingSwitch();
    return (await el.getAttribute('data-disabled')) === 'true';
  }

  async isPreferencesChecked(): Promise<boolean> {
    const el = await this.getPreferencesSwitch();
    return (await el.getAttribute('data-checked')) !== null;
  }

  async isPreferencesDisabled(): Promise<boolean> {
    const el = await this.getPreferencesSwitch();
    return (await el.getAttribute('data-disabled')) === 'true';
  }

  async togglePreferences(): Promise<void> {
    const el = await this.getPreferencesSwitch();
    await el.click();
  }

  async save(): Promise<void> {
    const button = await this.getSaveButton();
    await button.click();
  }

  async cancel(): Promise<void> {
    const button = await this.getCancelButton();
    await button.click();
  }
}
