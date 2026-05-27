import { ComponentHarness } from '@angular/cdk/testing';
import { UpdateNoteDto } from '@job-tracker-lite-angular/schemas';

export class EditNoteHarness extends ComponentHarness {
  static hostSelector = 'app-edit-note';

  private readonly getTitleInput = this.locatorFor('#title');
  private readonly getBodyInput = this.locatorFor('#body');
  private readonly getTitleError = this.locatorForAll(
    '#title + hlm-field-error, #title ~ hlm-field-error',
  );
  private readonly getBodyError = this.locatorForAll(
    '#body + hlm-field-error, #body ~ hlm-field-error',
  );
  private readonly getSubmitButton = this.locatorFor(
    'app-edit-job-dialog-footer button[type="submit"]',
  );
  private readonly getErrorAlert = this.locatorForOptional('[role="alert"]');

  async fillForm(values: Partial<UpdateNoteDto>): Promise<void> {
    if (values.title !== undefined) {
      const input = await this.getTitleInput();
      await input.clear();
      const title = values.title ?? '';
      if (title.length > 0) {
        await input.sendKeys(title);
      }
      await input.dispatchEvent('input');
      await input.dispatchEvent('blur');
    }
    if (values.body !== undefined) {
      const input = await this.getBodyInput();
      await input.clear();
      const body = values.body ?? '';
      if (body.length > 0) {
        await input.sendKeys(body);
      }
      await input.dispatchEvent('input');
      await input.dispatchEvent('blur');
    }
  }

  async submit(): Promise<void> {
    const button = await this.getSubmitButton();
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

  async getTitleErrorText(): Promise<string | null> {
    const errors = await this.getTitleError();
    for (const error of errors) {
      const hidden = await error.getAttribute('hidden');
      const text = await error.text();
      if (!hidden && text.trim().length > 0) {
        return text;
      }
    }
    return null;
  }

  async getBodyErrorText(): Promise<string | null> {
    const errors = await this.getBodyError();
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
