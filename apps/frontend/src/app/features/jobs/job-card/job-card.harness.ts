import { ComponentHarness } from '@angular/cdk/testing';

export class JobCardHarness extends ComponentHarness {
  static hostSelector = 'app-job-card';

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }
}
