import { ComponentHarness } from '@angular/cdk/testing';

export class AccountSettingsHarness extends ComponentHarness {
  static hostSelector = 'app-account-settings';

  private readonly currentEmailInputLocator =
    this.locatorFor('input#currentEmail');
  private readonly newEmailInputLocator = this.locatorFor('input#newEmail');
  private readonly currentPasswordInputLocator = this.locatorFor(
    'input#currentPassword',
  );
  private readonly newPasswordInputLocator =
    this.locatorFor('input#newPassword');
  private readonly confirmPasswordInputLocator = this.locatorFor(
    'input#confirmPassword',
  );
  private readonly changeEmailSubmitLocator = this.locatorFor(
    'button[form="changeEmailForm"]',
  );
  private readonly changePasswordSubmitLocator = this.locatorFor(
    'button[form="changePasswordForm"]',
  );
  private readonly togglePasswordVisibilityButtonLocator =
    this.locatorFor('button[aria-label]');

  async getCurrentEmail(): Promise<string> {
    const input = await this.currentEmailInputLocator();
    return String(await input.getProperty('value'));
  }

  async isCurrentEmailReadonly(): Promise<boolean> {
    const input = await this.currentEmailInputLocator();
    return Boolean(await input.getProperty('readOnly'));
  }

  async setNewEmail(email: string): Promise<void> {
    const input = await this.newEmailInputLocator();
    await input.clear();
    if (email) {
      await input.sendKeys(email);
    }
  }

  async submitChangeEmail(): Promise<void> {
    const button = await this.changeEmailSubmitLocator();
    await button.click();
  }

  async setCurrentPassword(password: string): Promise<void> {
    const input = await this.currentPasswordInputLocator();
    await input.clear();
    if (password) {
      await input.sendKeys(password);
    }
  }

  async setNewPassword(password: string): Promise<void> {
    const input = await this.newPasswordInputLocator();
    await input.clear();
    if (password) {
      await input.sendKeys(password);
    }
  }

  async getNewPasswordInputType(): Promise<string> {
    const input = await this.newPasswordInputLocator();
    return (await input.getAttribute('type')) ?? '';
  }

  async toggleNewPasswordVisibility(): Promise<void> {
    const button = await this.togglePasswordVisibilityButtonLocator();
    await button.click();
  }

  async setConfirmPassword(password: string): Promise<void> {
    const input = await this.confirmPasswordInputLocator();
    await input.clear();
    if (password) {
      await input.sendKeys(password);
    }
  }

  async submitChangePassword(): Promise<void> {
    const button = await this.changePasswordSubmitLocator();
    await button.click();
  }
}
