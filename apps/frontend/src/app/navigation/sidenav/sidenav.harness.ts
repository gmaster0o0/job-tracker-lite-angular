import { ComponentHarness } from '@angular/cdk/testing';

export class SidenavHarness extends ComponentHarness {
  static hostSelector = 'app-sidenav';

  private readonly statusBadgeLocator = this.locatorFor('span[hlmBadge]');
  private readonly statusIconLocator = this.locatorForOptional(
    'span[hlmBadge] ng-icon',
  );

  async getStatusBadgeText(): Promise<string> {
    const badge = await this.statusBadgeLocator();
    return await badge.text();
  }

  async getStatusIconName(): Promise<string | null> {
    const icon = await this.statusIconLocator();
    return icon ? await icon.getAttribute('name') : null;
  }
}
