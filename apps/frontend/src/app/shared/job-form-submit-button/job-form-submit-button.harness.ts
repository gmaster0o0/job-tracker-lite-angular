import { ComponentHarness } from '@angular/cdk/testing';

export class JobFormSubmitButtonHarness extends ComponentHarness {
  static hostSelector = 'app-job-form-submit-button';

  private readonly getSubmitButton = this.locatorFor('button[type="submit"]');
  private readonly getLoadingIcon = this.locatorForOptional(
    'ng-icon[name="lucideLoader2"]',
  );

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
}
