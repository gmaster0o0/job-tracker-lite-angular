import { ComponentHarness, TestElement } from '@angular/cdk/testing';

export class StatusHarness extends ComponentHarness {
  static hostSelector = 'app-status';

  // use a generic button locator to avoid depending on optional testing package
  private readonly backButtonLocator = this.locatorFor('button[hlmBtn]');
  private readonly apiBadgeLocator = this.locatorFor('span[hlmBadge]');
  private readonly dbBadgesLocator = this.locatorForAll('span[hlmBadge]');
  private readonly spinnerLocator = this.locatorForOptional('hlm-spinner');
  private readonly errorMessageLocator =
    this.locatorForOptional('.text-red-500');
  private readonly timestampLocator = this.locatorForOptional(
    'p[hlmCardDescription]',
  );
  private readonly uptimeLocator = this.locatorForOptional(
    'span[hlmCardFooter]',
  );

  async clickBackButton(): Promise<void> {
    const button = await this.backButtonLocator();
    await button.click();
  }

  // Keep a public accessor used by tests
  async getBackButton(): Promise<TestElement> {
    return await this.backButtonLocator();
  }

  async getApiStatus(): Promise<string | null> {
    const badge = await this.apiBadgeLocator();
    return await badge?.text();
  }

  async getDatabaseStatus(): Promise<string | null> {
    const badges = await this.dbBadgesLocator();
    if (badges && badges.length > 1) {
      return await badges[1].text();
    }
    return null;
  }

  async getQueueStatus(): Promise<string | null> {
    const badges = await this.dbBadgesLocator();
    if (badges && badges.length > 2) {
      return await badges[2].text();
    }
    return null;
  }

  async isLoading(): Promise<boolean> {
    return !!(await this.spinnerLocator());
  }

  async hasErrorMessage(): Promise<boolean> {
    return !!(await this.errorMessageLocator());
  }

  async getErrorText(): Promise<string | null> {
    const error = await this.errorMessageLocator();
    return error ? await error.text() : null;
  }

  async getTimestamp(): Promise<string | null> {
    const timestamp = await this.timestampLocator();
    return timestamp ? await timestamp.text() : null;
  }

  async getUptime(): Promise<string | null> {
    const uptime = await this.uptimeLocator();
    return uptime ? await uptime.text() : null;
  }
}
