import { ComponentHarness } from '@angular/cdk/testing';
import { AppearanceHarness } from './appearance/appearance.harness';

export class PreferencesHarness extends ComponentHarness {
  static hostSelector = 'app-preferences';

  private readonly getAppearanceComponent = this.locatorFor(AppearanceHarness);

  async getAppearanceHarness(): Promise<AppearanceHarness> {
    return this.getAppearanceComponent();
  }

  async getPageTitle(): Promise<string> {
    const title = await this.locatorFor('h1')();
    return title.text();
  }
}
