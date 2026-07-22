import { ComponentHarness } from '@angular/cdk/testing';

export class SidenavHarness extends ComponentHarness {
  static hostSelector = 'app-sidenav';

  private readonly statusBadgeLocator = this.locatorFor(
    '[data-testid="status-badge"]',
  );

  async getStatusBadgeText(): Promise<string> {
    const badge = await this.statusBadgeLocator();
    return await badge.text();
  }

  async getStatusHealthState(): Promise<string | null> {
    const badge = await this.statusBadgeLocator();
    return await badge.getAttribute('data-health-state');
  }
}
