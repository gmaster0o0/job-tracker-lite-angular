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
    const dataState = await el.getAttribute('data-state');
    const ariaChecked = await el.getAttribute('aria-checked');
    const dataChecked = await el.getAttribute('data-checked');
    return (
      dataState === 'checked' || ariaChecked === 'true' || dataChecked !== null
    );
  }

  async isEssentialDisabled(): Promise<boolean> {
    const el = await this.getEssentialSwitch();
    return (
      (await el.getAttribute('data-disabled')) === 'true' ||
      (await el.getAttribute('disabled')) !== null
    );
  }

  async isStatisticalChecked(): Promise<boolean> {
    const el = await this.getStatisticalSwitch();
    const dataState = await el.getAttribute('data-state');
    const ariaChecked = await el.getAttribute('aria-checked');
    const dataChecked = await el.getAttribute('data-checked');
    return (
      dataState === 'checked' || ariaChecked === 'true' || dataChecked !== null
    );
  }

  async isStatisticalDisabled(): Promise<boolean> {
    const el = await this.getStatisticalSwitch();
    return (
      (await el.getAttribute('data-disabled')) === 'true' ||
      (await el.getAttribute('disabled')) !== null
    );
  }

  async isMarketingChecked(): Promise<boolean> {
    const el = await this.getMarketingSwitch();
    const dataState = await el.getAttribute('data-state');
    const ariaChecked = await el.getAttribute('aria-checked');
    const dataChecked = await el.getAttribute('data-checked');
    return (
      dataState === 'checked' || ariaChecked === 'true' || dataChecked !== null
    );
  }

  async isMarketingDisabled(): Promise<boolean> {
    const el = await this.getMarketingSwitch();
    return (
      (await el.getAttribute('data-disabled')) === 'true' ||
      (await el.getAttribute('disabled')) !== null
    );
  }

  async isPreferencesChecked(): Promise<boolean> {
    const el = await this.getPreferencesSwitch();
    const dataState = await el.getAttribute('data-state');
    const ariaChecked = await el.getAttribute('aria-checked');
    const dataChecked = await el.getAttribute('data-checked');
    return (
      dataState === 'checked' || ariaChecked === 'true' || dataChecked !== null
    );
  }

  async isPreferencesDisabled(): Promise<boolean> {
    const el = await this.getPreferencesSwitch();
    return (
      (await el.getAttribute('data-disabled')) === 'true' ||
      (await el.getAttribute('disabled')) !== null
    );
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
