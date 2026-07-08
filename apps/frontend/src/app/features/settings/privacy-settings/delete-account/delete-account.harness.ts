import { ComponentHarness } from '@angular/cdk/testing';
import { ServerErrorAlertHarness } from '@job-tracker-lite-angular/frontend-shared';

export class DeleteAccountHarness extends ComponentHarness {
  static hostSelector = 'app-delete-account';

  private readonly deleteButtonLocator = this.locatorFor(
    'button[variant="destructive"]',
  );
  private readonly successTextLocator =
    this.locatorForOptional('.text-green-700');
  private readonly errorAlertLocator = this.locatorForOptional(
    ServerErrorAlertHarness,
  );

  async clickDeleteButton(): Promise<void> {
    const button = await this.deleteButtonLocator();
    await button.click();
  }

  async getSuccessText(): Promise<string> {
    const element = await this.successTextLocator();
    return element ? element.text() : '';
  }

  async getErrorAlert(): Promise<ServerErrorAlertHarness | null> {
    return this.errorAlertLocator();
  }
}
