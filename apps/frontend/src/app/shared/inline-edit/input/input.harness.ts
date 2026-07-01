import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing';

export interface InlineInputHarnessFilters extends BaseHarnessFilters {
  id?: string;
}

export class InlineInputHarness extends ComponentHarness {
  static hostSelector = 'app-inline-input';

  static with(
    options: InlineInputHarnessFilters = {},
  ): HarnessPredicate<InlineInputHarness> {
    return new HarnessPredicate(InlineInputHarness, options).addOption(
      'id',
      options.id,
      async (harness, id) =>
        (await (await harness.host()).getAttribute('id')) === id,
    );
  }

  protected getReadOnlyText = this.locatorForOptional('span.truncate');
  protected getInputElement = this.locatorForOptional('input');
  protected getIcon = this.locatorForOptional('ng-icon');

  async isEditing(): Promise<boolean> {
    return (await this.getInputElement()) !== null;
  }

  async getValue(): Promise<string> {
    if (await this.isEditing()) {
      const input = await this.getInputElement();
      return (await input?.getProperty('value')) ?? '';
    }
    const span = await this.getReadOnlyText();
    return (await span?.text()) ?? '';
  }

  async setValue(value: string): Promise<void> {
    const input = await this.getInputElement();
    if (!input) {
      throw new Error('Cannot set value while not in editing mode');
    }
    await input.clear();
    if (value) {
      await input.sendKeys(value);
    }
  }

  async getPlaceholder(): Promise<string> {
    const input = await this.getInputElement();
    if (input) {
      return (await input.getAttribute('placeholder')) ?? '';
    }
    return '';
  }

  async hasIcon(): Promise<boolean> {
    return (await this.getIcon()) !== null;
  }
}
