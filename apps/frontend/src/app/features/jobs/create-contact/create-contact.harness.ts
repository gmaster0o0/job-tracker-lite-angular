import { ComponentHarness } from '@angular/cdk/testing';
import { CreateContactDto } from '@job-tracker-lite-angular/api-interfaces';

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
}
