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

  protected getReadOnlyText = this.locatorForOptional(
    'span.whitespace-pre-wrap',
  );
  protected getTextareaElement = this.locatorForOptional('textarea');
  protected getIcon = this.locatorForOptional('ng-icon');

  async isEditing(): Promise<boolean> {
    return (await this.getTextareaElement()) !== null;
  }

  async getValue(): Promise<string> {
    if (await this.isEditing()) {
      const textarea = await this.getTextareaElement();
      return (await textarea?.getProperty('value')) ?? '';
    }

    const span = await this.getReadOnlyText();
    return (await span?.text()) ?? '';
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
}
