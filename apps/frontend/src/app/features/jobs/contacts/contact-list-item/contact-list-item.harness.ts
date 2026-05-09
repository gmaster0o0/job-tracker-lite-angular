import { ComponentHarness } from '@angular/cdk/testing';

export class ContactListItemHarness extends ComponentHarness {
  static hostSelector = 'app-contact-list-item';

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }
}
