import { ComponentHarness } from '@angular/cdk/testing';
import { CreateContactDto } from '@job-tracker-lite-angular/schemas';

export class CreateContactHarness extends ComponentHarness {
  static hostSelector = 'app-create-contact';

  private readonly getNameInput = this.locatorFor('#name');
  private readonly getEmailInput = this.locatorFor('#email');
  private readonly getPhoneInput = this.locatorFor('#phoneNumber');
  private readonly getNameError = this.locatorForAll(
    '#name + hlm-field-error, #name ~ hlm-field-error',
  );
  private readonly getEmailError = this.locatorForAll(
    '#email + hlm-field-error, #email ~ hlm-field-error',
  );
  private readonly getPhoneError = this.locatorForAll(
    '#phoneNumber + hlm-field-error, #phoneNumber ~ hlm-field-error',
  );
  private readonly getSubmitButton = this.locatorFor(
    'app-create-job-dialog-footer button[type="submit"]',
  );
  private readonly getErrorAlert = this.locatorForOptional('[role="alert"]');

  async fillForm(values: Partial<CreateContactDto>): Promise<void> {
    if (values.name !== undefined) {
      const input = await this.getNameInput();
      await input.clear();
      const name = values.name ?? '';
      if (name.length > 0) {
        await input.sendKeys(name);
      }
      await input.dispatchEvent('input');
      await input.dispatchEvent('blur');
    }

    if (values.email !== undefined) {
      const input = await this.getEmailInput();
      await input.clear();
      const email = values.email ?? '';
      if (email.length > 0) {
        await input.sendKeys(email);
      }
      await input.dispatchEvent('input');
      await input.dispatchEvent('blur');
    }

    if (values.phoneNumber !== undefined) {
      const input = await this.getPhoneInput();
      await input.clear();
      const phone = values.phoneNumber ?? '';
      if (phone.length > 0) {
        await input.sendKeys(phone);
      }
      await input.dispatchEvent('input');
      await input.dispatchEvent('blur');
    }
  }

  async submit(): Promise<void> {
    const button = await this.getSubmitButton();
    await button.click();
  }

  async isSubmitDisabled(): Promise<boolean> {
    const button = await this.getSubmitButton();
    return button.getProperty('disabled');
  }

  async isErrorVisible(): Promise<boolean> {
    const alert = await this.getErrorAlert();
    return alert !== null;
  }

  async getErrorText(): Promise<string | null> {
    const alert = await this.getErrorAlert();
    return alert ? alert.text() : null;
  }

  async getNameErrorText(): Promise<string | null> {
    const errors = await this.getNameError();
    for (const error of errors) {
      const hidden = await error.getAttribute('hidden');
      const text = await error.text();
      if (!hidden && text.trim().length > 0) {
        return text;
      }
    }
    return null;
  }

  async getEmailErrorText(): Promise<string | null> {
    const errors = await this.getEmailError();
    for (const error of errors) {
      const hidden = await error.getAttribute('hidden');
      const text = await error.text();
      if (!hidden && text.trim().length > 0) {
        return text;
      }
    }
    return null;
  }

  async getPhoneErrorText(): Promise<string | null> {
    const errors = await this.getPhoneError();
    for (const error of errors) {
      const hidden = await error.getAttribute('hidden');
      const text = await error.text();
      if (!hidden && text.trim().length > 0) {
        return text;
      }
    }
    return null;
  }
}
