import { ComponentHarness } from '@angular/cdk/testing';
import { ProfileVisibilitySettingsHarness } from '../visibility-settings/visibility-settings.harness';

export class SkillManagerHarness extends ComponentHarness {
  static hostSelector = 'app-skill-manager';

  private readonly inputLocator = this.locatorFor('input#newSkill');
  private readonly badgesLocator = this.locatorForAll('hlm-badge');
  private readonly removeButtonsLocator = this.locatorForAll(
    'hlm-badge button[aria-label]',
  );
  private readonly saveButtonLocator = this.locatorForOptional(
    '[data-testid="save-skills-btn"]',
  );
  private readonly discardButtonLocator = this.locatorForOptional(
    '[data-testid="discard-skills-btn"]',
  );
  private readonly addNewSkillButtonLocator = this.locatorForOptional(
    '[data-testid="add-new-skill-btn"]',
  );
  private readonly visibilitySettingsLocator = this.locatorForOptional(
    ProfileVisibilitySettingsHarness,
  );

  async enterSkill(value: string): Promise<void> {
    const input = await this.inputLocator();
    await input.clear();
    await input.sendKeys(value);
  }

  async pressEnterOnInput(): Promise<void> {
    const input = await this.inputLocator();
    await input.sendKeys('\n');
  }

  async getSkillTexts(): Promise<string[]> {
    const badges = await this.badgesLocator();
    const texts = await Promise.all(badges.map((badge) => badge.text()));
    return texts.map((text) => text.replace(/\s+/g, ' ').trim());
  }

  async removeSkillAt(index: number): Promise<void> {
    const buttons = await this.removeButtonsLocator();
    if (!buttons[index]) {
      throw new Error(`Remove button at index ${index} not found`);
    }
    await buttons[index].click();
  }

  async clickAddNewElement(): Promise<void> {
    const button = await this.addNewSkillButtonLocator();
    if (button) {
      await button.click();
      return;
    }

    throw new Error('Add new element button not found');
  }

  async hasSaveButton(): Promise<boolean> {
    return !!(await this.saveButtonLocator());
  }

  async hasDiscardButton(): Promise<boolean> {
    return !!(await this.discardButtonLocator());
  }

  async clickSave(): Promise<void> {
    const saveButton = await this.saveButtonLocator();
    if (!saveButton) {
      throw new Error('Save button not found');
    }
    await saveButton.click();
  }

  async clickDiscard(): Promise<void> {
    const discardButton = await this.discardButtonLocator();
    if (!discardButton) {
      throw new Error('Discard button not found');
    }
    await discardButton.click();
  }

  async clickVisibilityStep(index: number): Promise<void> {
    const visibility = await this.visibilitySettingsLocator();
    if (!visibility) {
      throw new Error('Visibility settings not found');
    }

    await visibility.clickStep(index);
  }
}
