import { ComponentHarness } from '@angular/cdk/testing';
import { CreateContactDto } from '@job-tracker-lite-angular/schemas';

export class CreateContactHarness extends ComponentHarness {
  static hostSelector = 'app-create-contact';

  private readonly getNameInput = this.locatorFor('[formControlName="name"]');
  private readonly getEmailInput = this.locatorFor('[formControlName="email"]');
  private readonly getPhoneInput = this.locatorFor(
    '[formControlName="phoneNumber"]',
  );
  private readonly getSubmitButton = this.locatorFor('button[type="submit"]');

  async fillForm(values: Partial<CreateContactDto>): Promise<void> {
    if (values.name !== undefined) {
      const input = await this.getNameInput();
      await input.clear();
      await input.sendKeys(values.name);
      await input.dispatchEvent('input');
    }

    if (values.email !== undefined) {
      const input = await this.getEmailInput();
      await input.clear();
      const email = values.email ?? '';
      if (email.length > 0) {
        await input.sendKeys(email);
      }
      await input.dispatchEvent('input');
    }

    if (values.phoneNumber !== undefined) {
      const input = await this.getPhoneInput();
      await input.clear();
      const phone = values.phoneNumber ?? '';
      if (phone.length > 0) {
        await input.sendKeys(phone);
      }
      await input.dispatchEvent('input');
    }
  }

  async submit(): Promise<void> {
    const button = await this.getSubmitButton();
    await button.click();
  }
}
