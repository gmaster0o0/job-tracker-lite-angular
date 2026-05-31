import { ComponentHarness } from '@angular/cdk/testing';
import { ServerErrorAlertHarness } from '@job-tracker-lite-angular/frontend-shared';

export class RegisterHarness extends ComponentHarness {
  static hostSelector = 'app-register';

  private readonly nameInputLocator = this.locatorFor('input#name');
  private readonly emailInputLocator = this.locatorFor('input#email');
  private readonly passwordInputLocator = this.locatorFor('input#password');
  private readonly confirmPasswordInputLocator = this.locatorFor(
    'input#confirmPassword',
  );
  private readonly submitButtonLocator = this.locatorFor(
    'button[type="submit"]',
  );
  private readonly errorAlertLocator = this.locatorForOptional(
    ServerErrorAlertHarness,
  );

  async setName(name: string): Promise<void> {
    const input = await this.nameInputLocator();
    await input.clear();
    if (name) {
      await input.sendKeys(name);
    }
  }

  async setEmail(email: string): Promise<void> {
    const input = await this.emailInputLocator();
    await input.clear();
    if (email) {
      await input.sendKeys(email);
    }
  }

  async setPassword(password: string): Promise<void> {
    const input = await this.passwordInputLocator();
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
