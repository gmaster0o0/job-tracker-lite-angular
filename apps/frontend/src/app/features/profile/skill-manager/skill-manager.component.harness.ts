import { ComponentHarness } from '@angular/cdk/testing';

export class SkillManagerHarness extends ComponentHarness {
  static hostSelector = 'app-skill-manager';

  private readonly inputLocator = this.locatorFor('input#newSkill');
  private readonly buttonsLocator = this.locatorForAll('button');
  private readonly badgesLocator = this.locatorForAll('hlm-badge');
  private readonly removeButtonsLocator = this.locatorForAll(
    'hlm-badge button[aria-label]',
  );

  private async findButtonByText(
    needle: string,
  ): Promise<import('@angular/cdk/testing').TestElement | null> {
    const buttons = await this.buttonsLocator();
    for (const button of buttons) {
      const text = (await button.text()).toLowerCase();
      if (text.includes(needle.toLowerCase())) {
        return button;
      }
    }

    return null;
  }

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

  async hasSaveButton(): Promise<boolean> {
    return !!(await this.findButtonByText('save'));
  }

  async hasDiscardButton(): Promise<boolean> {
    return !!(await this.findButtonByText('discard'));
  }

  async clickSave(): Promise<void> {
    const saveButton = await this.findButtonByText('save');
    if (!saveButton) {
      throw new Error('Save button not found');
    }
    await saveButton.click();
  }

  async clickDiscard(): Promise<void> {
    const discardButton = await this.findButtonByText('discard');
    if (!discardButton) {
      throw new Error('Discard button not found');
    }
    await discardButton.click();
  }
}
