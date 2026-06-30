import { ComponentHarness } from '@angular/cdk/testing';
import { InlineInputHarness } from '../../shared/inline-edit/input/input.component.harness';
import { InlineTextareaHarness } from '../../shared/inline-edit/textarea/textarea.component.harness';

export class ProfileHarness extends ComponentHarness {
  static hostSelector = 'app-profile';

  private getNameInput = this.locatorFor(
    InlineInputHarness.with({ id: 'name' }),
  );
  private getTitleInput = this.locatorFor(
    InlineInputHarness.with({ id: 'title' }),
  );
  private getCityInput = this.locatorFor(
    InlineInputHarness.with({ id: 'city' }),
  );
  private getBioTextarea = this.locatorFor(
    InlineTextareaHarness.with({ id: 'bio' }),
  );
  private getButtons = this.locatorForAll('button');

  async getName(): Promise<string> {
    const input = await this.getNameInput();
    return input.getValue();
  }

  async setName(value: string): Promise<void> {
    const input = await this.getNameInput();
    await input.setValue(value);
  }

  async getBio(): Promise<string> {
    const textarea = await this.getBioTextarea();
    return textarea.getValue();
  }

  async setBio(value: string): Promise<void> {
    const textarea = await this.getBioTextarea();
    await textarea.setValue(value);
  }

  async clickEditPersonal(): Promise<void> {
    const buttons = await this.getButtons();
    for (const button of buttons) {
      const text = await button.text();
      if (text.toLowerCase().includes('edit')) {
        return button.click();
      }
    }
    throw new Error('Edit button not found');
  }

  async save(): Promise<void> {
    const buttons = await this.getButtons();
    for (const button of buttons) {
      const text = await button.text();
      // The save button is inside app-save-button, but getButtons is locatorForAll('button')
      // so it should find the inner button.
      if (text.toLowerCase().includes('save')) {
        return button.click();
      }
    }
    throw new Error('Save button not found');
  }
}
