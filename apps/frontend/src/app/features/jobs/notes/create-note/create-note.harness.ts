import { ComponentHarness } from '@angular/cdk/testing';
import { CreateNoteDto } from '@job-tracker-lite-angular/api-interfaces';

export class CreateNoteHarness extends ComponentHarness {
  static hostSelector = 'app-create-note';

  private readonly getTitleInput = this.locatorFor('[formControlName="title"]');
  private readonly getBodyInput = this.locatorFor('[formControlName="body"]');
  private readonly getSubmitButton = this.locatorFor(
    'app-save-button button[type="submit"]',
  );

  async fillForm(values: Partial<CreateNoteDto>): Promise<void> {
    if (values.title !== undefined) {
      const input = await this.getTitleInput();
      await input.clear();
      await input.sendKeys(values.title);
      await input.dispatchEvent('input');
    }

    if (values.body !== undefined) {
      const input = await this.getBodyInput();
      await input.clear();
      await input.sendKeys(values.body);
      await input.dispatchEvent('input');
    }
  }

  async submit(): Promise<void> {
    const button = await this.getSubmitButton();
    await button.click();
  }
}
