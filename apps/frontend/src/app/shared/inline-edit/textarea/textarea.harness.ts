import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing';

export interface InlineTextareaHarnessFilters extends BaseHarnessFilters {
  id?: string;
}

export class InlineTextareaHarness extends ComponentHarness {
  static hostSelector = 'app-inline-textarea';

  static with(
    options: InlineTextareaHarnessFilters = {},
  ): HarnessPredicate<InlineTextareaHarness> {
    return new HarnessPredicate(InlineTextareaHarness, options).addOption(
      'id',
      options.id,
      async (harness, id) =>
        (await (await harness.host()).getAttribute('id')) === id,
    );
  }

  protected getTextareaElement = this.locatorForOptional('textarea');
  protected getIcon = this.locatorForOptional('ng-icon');
  protected getCharactersLeftElement = this.locatorForOptional(
    '[data-testid="characters-left"]',
  );

  async isEditing(): Promise<boolean> {
    const textarea = await this.getTextareaElement();
    if (!textarea) {
      return false;
    }

    return (await textarea.getAttribute('readonly')) === null;
  }

  async getValue(): Promise<string> {
    const textarea = await this.getTextareaElement();
    return (await textarea?.getProperty('value')) ?? '';
  }

  async setValue(value: string): Promise<void> {
    const textarea = await this.getTextareaElement();
    if (!textarea) {
      throw new Error('Cannot set value while not in editing mode');
    }
    await textarea.clear();
    if (value) {
      await textarea.sendKeys(value);
    }
  }

  async getPlaceholder(): Promise<string> {
    const textarea = await this.getTextareaElement();
    if (textarea) {
      return (await textarea.getAttribute('placeholder')) ?? '';
    }
    return '';
  }

  async hasIcon(): Promise<boolean> {
    return (await this.getIcon()) !== null;
  }

  async getMaxLength(): Promise<number | null> {
    const textarea = await this.getTextareaElement();
    if (!textarea) return null;
    const maxLength = await textarea.getAttribute('maxlength');
    return maxLength ? parseInt(maxLength, 10) : null;
  }

  async getCharactersLeftText(): Promise<string | null> {
    const element = await this.getCharactersLeftElement();
    return element ? await element.text() : null;
  }
}
