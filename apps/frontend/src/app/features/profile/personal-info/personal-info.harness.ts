import { ComponentHarness } from '@angular/cdk/testing';
import { InlineInputHarness } from '../../../shared/inline-edit/input/input.harness';
import { InlineTextareaHarness } from '../../../shared/inline-edit/textarea/textarea.harness';

export class PersonalInfoHarness extends ComponentHarness {
  static hostSelector = 'app-personal-info';

  private readonly nameInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'name' }),
  );
  private readonly titleInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'title' }),
  );
  private readonly cityInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'city' }),
  );
  private readonly bioTextareaLocator = this.locatorFor(
    InlineTextareaHarness.with({ id: 'bio' }),
  );
  private readonly buttonsLocator = this.locatorForAll('button');
  private readonly editButtonLocator = this.locatorFor(
    'app-edit-button button',
  );

  async getName(): Promise<string> {
    const input = await this.nameInputLocator();
    return input.getValue();
  }

  async setName(value: string): Promise<void> {
    const input = await this.nameInputLocator();
    await input.setValue(value);
  }

  async getTitle(): Promise<string> {
    const input = await this.titleInputLocator();
    return input.getValue();
  }

  async setTitle(value: string): Promise<void> {
    const input = await this.titleInputLocator();
    await input.setValue(value);
  }

  async getCity(): Promise<string> {
    const input = await this.cityInputLocator();
    return input.getValue();
  }

  async setCity(value: string): Promise<void> {
    const input = await this.cityInputLocator();
    await input.setValue(value);
  }

  async getBio(): Promise<string> {
    const textarea = await this.bioTextareaLocator();
    return textarea.getValue();
  }

  async setBio(value: string): Promise<void> {
    const textarea = await this.bioTextareaLocator();
    await textarea.setValue(value);
  }

  async isEditDisabled(): Promise<boolean> {
    const button = await this.editButtonLocator();
    return button.getProperty('disabled');
  }

  async clickEdit(): Promise<void> {
    const buttons = await this.buttonsLocator();
    for (const button of buttons) {
      const text = await button.text();
      if (text.toLowerCase().includes('edit')) {
        return button.click();
      }
    }
    throw new Error('Edit button not found');
  }

  async clickSave(): Promise<void> {
    const buttons = await this.buttonsLocator();
    for (const button of buttons) {
      const text = await button.text();
      if (text.toLowerCase().includes('save')) {
        return button.click();
      }
    }
    throw new Error('Save button not found');
  }

  async clickCancel(): Promise<void> {
    const buttons = await this.buttonsLocator();
    for (const button of buttons) {
      const text = await button.text();
      if (text.toLowerCase().includes('cancel')) {
        return button.click();
      }
    }
    throw new Error('Cancel button not found');
  }
}
