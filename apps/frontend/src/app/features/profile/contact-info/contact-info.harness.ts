import { ComponentHarness } from '@angular/cdk/testing';
import { InlineInputHarness } from '../../../shared/inline-edit/input/input.harness';
import { EditButtonHarness } from '../../../shared/edit-button/edit-button.harness';
import { CancelButtonHarness } from '../../../shared/cancel-button/cancel-button.harness';
import { ProfileVisibilitySettingsHarness } from '../visibility-settings/visibility-settings.harness';

export class ContactInfoHarness extends ComponentHarness {
  static hostSelector = 'app-contact-info';

  private readonly emailInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'email' }),
  );
  private readonly linkedinInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'linkedin' }),
  );
  private readonly githubInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'github' }),
  );
  private readonly websiteInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'website' }),
  );
  private readonly editButtonLocator = this.locatorFor(EditButtonHarness);
  private readonly cancelButtonLocator = this.locatorFor(CancelButtonHarness);
  private readonly saveButtonLocator = this.locatorFor(
    'app-save-button button[type="submit"]',
  );
  private readonly visibilitySettingsLocator = this.locatorForOptional(
    ProfileVisibilitySettingsHarness,
  );

  async getEmail(): Promise<string> {
    const input = await this.emailInputLocator();
    return input.getValue();
  }

  async setEmail(value: string): Promise<void> {
    const input = await this.emailInputLocator();
    await input.setValue(value);
  }

  async getLinkedin(): Promise<string> {
    const input = await this.linkedinInputLocator();
    return input.getValue();
  }

  async setLinkedin(value: string): Promise<void> {
    const input = await this.linkedinInputLocator();
    await input.setValue(value);
  }

  async getGithub(): Promise<string> {
    const input = await this.githubInputLocator();
    return input.getValue();
  }

  async setGithub(value: string): Promise<void> {
    const input = await this.githubInputLocator();
    await input.setValue(value);
  }

  async getWebsite(): Promise<string> {
    const input = await this.websiteInputLocator();
    return input.getValue();
  }

  async setWebsite(value: string): Promise<void> {
    const input = await this.websiteInputLocator();
    await input.setValue(value);
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
