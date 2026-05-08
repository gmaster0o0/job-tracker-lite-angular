import { ComponentHarness } from '@angular/cdk/testing';

export class AppHarness extends ComponentHarness {
  static hostSelector = 'app-root';

  private readonly getRouterOutlet = this.locatorForOptional('router-outlet');

  async hasRouterOutlet(): Promise<boolean> {
    const outlet = await this.getRouterOutlet();
    return !!outlet;
  }
}
