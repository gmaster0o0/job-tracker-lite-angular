import { ComponentHarness } from '@angular/cdk/testing';

export class ContactsTabHarness extends ComponentHarness {
  static hostSelector = 'app-contacts-tab';

  private readonly getHeader = this.locatorFor('h2');
  private readonly getAddContactButton = this.locatorFor(
    'button[type="button"]',
  );

  async getHeaderText(): Promise<string> {
    const header = await this.getHeader();
    return header.text();
  }

  async hasAddContactButton(): Promise<boolean> {
    const button = await this.getAddContactButton();
    return !!button;
  }

  async clickAddContact(): Promise<void> {
    const button = await this.getAddContactButton();
    await button.click();
  }
}
