import { ComponentHarness } from '@angular/cdk/testing';

export class ContactListHarness extends ComponentHarness {
  static hostSelector = 'app-contact-list';

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }
}
