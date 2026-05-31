import { ComponentHarness } from '@angular/cdk/testing';
import { ServerErrorAlertHarness } from '@job-tracker-lite-angular/frontend-shared';

export class VerifyEmailNoticeHarness extends ComponentHarness {
  static hostSelector = 'app-verify-email-notice';

  private readonly emailInputLocator = this.locatorFor('input#email');
  private readonly submitButtonLocator = this.locatorFor(
    'button[type="submit"]',
  );
  private readonly errorAlertLocator = this.locatorForOptional(
    ServerErrorAlertHarness,
  );

  async setEmail(email: string): Promise<void> {
    const input = await this.emailInputLocator();
    await input.clear();
    if (email) {
      await input.sendKeys(email);
    }
  }

  async submit(): Promise<void> {
    const button = await this.submitButtonLocator();
    await button.click();
  }

  async isSubmitDisabled(): Promise<boolean> {
    const button = await this.submitButtonLocator();
    return button.getProperty('disabled');
  }

  async getErrorAlert(): Promise<ServerErrorAlertHarness | null> {
    return this.errorAlertLocator();
  }
}
