import { ComponentHarness } from '@angular/cdk/testing';
import { UpdateContactDto } from '@job-tracker-lite-angular/api-interfaces';

export class EditContactHarness extends ComponentHarness {
  static hostSelector = 'app-edit-contact';

  private readonly getNameInput = this.locatorFor('[formControlName="name"]');
  private readonly getEmailInput = this.locatorFor('[formControlName="email"]');
  private readonly getPhoneInput = this.locatorFor(
    '[formControlName="phoneNumber"]',
  );
  private readonly getSubmitButton = this.locatorFor('button[type="submit"]');
  private readonly getErrorMessage = this.locatorForOptional('.text-red-600');

  async fillForm(values: Partial<UpdateContactDto>): Promise<void> {
    if (values.name !== undefined) {
      const input = await this.getNameInput();
      await input.clear();
      await input.sendKeys(values.name);
      await input.dispatchEvent('input');
    }

    if (values.email !== undefined) {
      const input = await this.getEmailInput();
      await input.clear();
      await input.sendKeys(values.email);
      await input.dispatchEvent('input');
    }

    if (values.phoneNumber !== undefined) {
      const input = await this.getPhoneInput();
      await input.clear();
      await input.sendKeys(values.phoneNumber);
      await input.dispatchEvent('input');
    }
  }

  async submit(): Promise<void> {
    const button = await this.getSubmitButton();
    await button.click();
  }

  async getSubmitErrorText(): Promise<string | null> {
    const error = await this.getErrorMessage();
    return error ? error.text() : null;
  }
}
