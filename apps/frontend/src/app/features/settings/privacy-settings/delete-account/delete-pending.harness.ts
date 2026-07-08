import { ComponentHarness } from '@angular/cdk/testing';
import { ServerErrorAlertHarness } from '@job-tracker-lite-angular/frontend-shared';

export class DeletePendingHarness extends ComponentHarness {
  static hostSelector = 'app-delete-pending';

  private readonly countdownLocator = this.locatorForOptional('.mt-2.text-3xl');
  private readonly recoverButtonLocator = this.locatorFor('button');
  private readonly errorAlertLocator = this.locatorForOptional(
    ServerErrorAlertHarness,
  );

  async getCountdownText(): Promise<string> {
    const el = await this.countdownLocator();
    return el ? el.text() : '';
  }

  async clickRecoverButton(): Promise<void> {
    const button = await this.recoverButtonLocator();
    await button.click();
  }

  async getErrorAlert(): Promise<ServerErrorAlertHarness | null> {
    return this.errorAlertLocator();
  }
}
