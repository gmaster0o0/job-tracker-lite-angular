import { ComponentHarness } from '@angular/cdk/testing';
import {
  InlineInputHarness,
  InlineTextareaHarness,
  EditButtonHarness,
  CancelButtonHarness,
  ProfileVisibilitySettingsHarness,
} from '@job-tracker-lite-angular/frontend-shared';

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
  private readonly editButtonLocator = this.locatorFor(EditButtonHarness);
  private readonly cancelButtonLocator = this.locatorFor(CancelButtonHarness);
  private readonly saveButtonLocator = this.locatorFor(
    'app-save-button button[type="submit"]',
  );
  private readonly visibilitySettingsLocator = this.locatorForOptional(
    ProfileVisibilitySettingsHarness,
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
    return button.isDisabled();
  }

  async clickEdit(): Promise<void> {
    const button = await this.editButtonLocator();
    await button.click();
  }

  async clickSave(): Promise<void> {
    const button = await this.saveButtonLocator();
    await button.click();
  }

  async clickCancel(): Promise<void> {
    const button = await this.cancelButtonLocator();
    await button.click();
  }

  async clickVisibilityStep(index: number): Promise<void> {
    const visibility = await this.visibilitySettingsLocator();
    if (!visibility) {
      throw new Error('Visibility settings not found');
    }

    await visibility.clickStep(index);
  }
}
