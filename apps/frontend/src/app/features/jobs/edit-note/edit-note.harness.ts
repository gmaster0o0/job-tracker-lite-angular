import { ComponentHarness } from '@angular/cdk/testing';
import { UpdateNoteDto } from '@job-tracker-lite-angular/api-interfaces';

export class EditNoteComponentHarness extends ComponentHarness {
  static hostSelector = 'app-edit-note';

  private getTitleInput = this.locatorFor('[formControlName="title"]');
  private getBodyInput = this.locatorFor('[formControlName="body"]');
  private getForm = this.locatorFor('form');
  private getSubmitButton = this.locatorFor('button[type="submit"]');
  private getCancelButton = this.locatorFor('button[type="button"]');
  private getErrorMessage = this.locatorForOptional('.text-red-600');

  async setTitle(title: string): Promise<void> {
    const input = await this.getTitleInput();
    await input.clear();
    await input.sendKeys(title);
    await input.dispatchEvent('input');
  }

  async setBody(body: string): Promise<void> {
    const input = await this.getBodyInput();
    await input.clear();
    await input.sendKeys(body);
    await input.dispatchEvent('input');
  }

  async setFormValues(values: Partial<UpdateNoteDto>): Promise<void> {
    if (values.title !== undefined) {
      await this.setTitle(values.title);
    }
    if (values.body !== undefined) {
      await this.setBody(values.body);
    }
  }

  async submit(): Promise<void> {
    const button = await this.getSubmitButton();
    await button.click();
  }

  async clickSubmit(): Promise<void> {
    const button = await this.getSubmitButton();
    await button.click();
  }

  async clickCancel(): Promise<void> {
    const button = await this.getCancelButton();
    await button.click();
  }

  async getTitleValue(): Promise<string> {
    const input = await this.getTitleInput();
    return input.getProperty('value');
  }

  async getBodyValue(): Promise<string> {
    const input = await this.getBodyInput();
    return input.getProperty('value');
  }

  async getErrorMessageText(): Promise<string | null> {
    const errorElement = await this.getErrorMessage();
    return errorElement ? errorElement.text() : null;
  }

  async isSubmitButtonDisabled(): Promise<boolean> {
    const button = await this.getSubmitButton();
    return button.getProperty('disabled');
  }
}
