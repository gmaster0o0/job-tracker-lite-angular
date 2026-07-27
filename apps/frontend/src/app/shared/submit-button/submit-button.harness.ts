import { ComponentHarness } from '@angular/cdk/testing';

export class SubmitButtonHarness extends ComponentHarness {
  static hostSelector = 'app-submit-button';

  private readonly getSubmitButton = this.locatorFor('button[type="submit"]');
  private readonly getLoadingIcon = this.locatorForOptional(
    'ng-icon[name="lucideLoader2"]',
  );
  private readonly getIdleIcon = this.locatorForOptional('ng-icon');

  async getLabelText(): Promise<string> {
    const button = await this.getSubmitButton();
    return button.text();
  }

  async isDisabled(): Promise<boolean> {
    const button = await this.getSubmitButton();
    return button.getProperty('disabled');
  }

  async getFormId(): Promise<string | null> {
    const button = await this.getSubmitButton();
    return button.getAttribute('form');
  }

  async isSubmittingStateVisible(): Promise<boolean> {
    const icon = await this.getLoadingIcon();
    return !!icon;
  }

  async getIdleIconMarkup(): Promise<string> {
    const icon = await this.getIdleIcon();
    if (!icon) {
      return '';
    }
    return String((await icon.getProperty('innerHTML')) ?? '');
  }
}
