import { ComponentHarness } from '@angular/cdk/testing';

export class UsersComponentHarness extends ComponentHarness {
  static hostSelector = 'app-users';

  private getLoadingIndicator = this.locatorForOptional(
    '[data-testid="users-loading"]',
  );
  private getUserRows = this.locatorForAll('[data-testid="users-row"]');
  private getProfileLinks = this.locatorForAll(
    '[data-testid="view-profile-link"]',
  );

  async isLoading(): Promise<boolean> {
    const loading = await this.getLoadingIndicator();
    return loading !== null;
  }

  async getUserCount(): Promise<number> {
    const rows = await this.getUserRows();
    return rows.length;
  }

  async getProfileLinkHrefs(): Promise<string[]> {
    const links = await this.getProfileLinks();
    return Promise.all(
      links.map(async (link) => (await link.getAttribute('href')) || ''),
    );
  }

  async hasUserName(name: string): Promise<boolean> {
    const text = await this.host().then((h) => h.text());
    return text.includes(name);
  }

  async hasUserEmail(email: string): Promise<boolean> {
    const text = await this.host().then((h) => h.text());
    return text.includes(email);
  }
}
