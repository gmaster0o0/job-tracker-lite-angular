import { ComponentHarness } from '@angular/cdk/testing';
import { ServerErrorAlertHarness } from '@job-tracker-lite-angular/frontend-shared';

export class VerifyEmailHarness extends ComponentHarness {
  static hostSelector = 'app-verify-email';

  private readonly errorAlertLocator = this.locatorForOptional(
    ServerErrorAlertHarness,
  );
  private readonly successTextLocator = this.locatorForOptional(
    '.text-sm.text-muted-foreground',
  );

  async getErrorAlert(): Promise<ServerErrorAlertHarness | null> {
    return this.errorAlertLocator();
  }

  async getSuccessText(): Promise<string> {
    const element = await this.successTextLocator();
    return element ? element.text() : '';
  }
}
