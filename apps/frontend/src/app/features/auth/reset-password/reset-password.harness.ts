import { ComponentHarness } from '@angular/cdk/testing';
import { ServerErrorAlertHarness } from '@job-tracker-lite-angular/frontend-shared';

export class ResetPasswordHarness extends ComponentHarness {
  static hostSelector = 'app-reset-password';

  private readonly newPasswordInputLocator =
    this.locatorFor('input#newPassword');
  private readonly confirmPasswordInputLocator = this.locatorFor(
    'input#confirmPassword',
  );
  private readonly submitButtonLocator = this.locatorFor(
    'button[type="submit"]',
  );
  private readonly errorAlertLocator = this.locatorForOptional(
    ServerErrorAlertHarness,
  );

  async setNewPassword(password: string): Promise<void> {
    const input = await this.newPasswordInputLocator();
    await input.clear();
    if (password) {
      await input.sendKeys(password);
    }
  }

  async setConfirmPassword(password: string): Promise<void> {
    const input = await this.confirmPasswordInputLocator();
    await input.clear();
    if (password) {
      await input.sendKeys(password);
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
