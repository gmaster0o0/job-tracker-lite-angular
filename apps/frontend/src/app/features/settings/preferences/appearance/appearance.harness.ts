import { ComponentHarness } from '@angular/cdk/testing';

export class AppearanceHarness extends ComponentHarness {
  static hostSelector = 'app-appearance';

  private readonly getLabels = this.locatorForAll('label');

  async selectAppearanceOption(
    value: 'light' | 'dark' | 'system',
  ): Promise<void> {
    const labels = await this.getLabels();
    for (const label of labels) {
      const htmlFor = await label.getAttribute('for');
      if (htmlFor === `radio-${value}`) {
        await label.click();
        return;
      }
    }
    throw new Error(`Appearance option "${value}" not found`);
  }

  async getAppearanceOptions(): Promise<
    Array<{ label: string; value: string }>
  > {
    const labels = await this.getLabels();
    const result: Array<{ label: string; value: string }> = [];

    for (const label of labels) {
      const htmlFor = await label.getAttribute('for');
      const labelText = await label.text();
      if (htmlFor) {
        const value = htmlFor.replace('radio-', '');
        result.push({ label: labelText.trim(), value });
      }
    }

    return result;
  }
}
