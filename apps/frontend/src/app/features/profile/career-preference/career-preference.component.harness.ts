import { ComponentHarness } from '@angular/cdk/testing';

export class CareerPreferenceHarness extends ComponentHarness {
  static hostSelector = 'app-career-preference';

  private readonly titleLocator = this.locatorFor('[hlmCardTitle]');
  private readonly experienceLevelSelectLocator = this.locatorFor(
    'hlm-select#experience',
  );
  private readonly workingStyleSelectLocator = this.locatorFor(
    'hlm-select#workingStyle',
  );
  private readonly careerTypeSelectLocator = this.locatorFor(
    'hlm-select#careerType',
  );
  private readonly saveStateIndicatorLocator = this.locatorForOptional(
    '[data-testid="saveStateIndicator"]',
  );

  async getTitle(): Promise<string> {
    const title = await this.titleLocator();
    return title.text();
  }

  async getExperienceLevelSelect() {
    return this.experienceLevelSelectLocator();
  }

  async getWorkingStyleSelect() {
    return this.workingStyleSelectLocator();
  }

  async getCareerTypeSelect() {
    return this.careerTypeSelectLocator();
  }

  async getSaveStateText(): Promise<string | null> {
    const indicator = await this.saveStateIndicatorLocator();
    if (!indicator) return null;
    return indicator.text();
  }

  async isSaving(): Promise<boolean> {
    const text = await this.getSaveStateText();
    return text?.includes('Saving') ?? false;
  }

  async isSaved(): Promise<boolean> {
    const text = await this.getSaveStateText();
    return text?.includes('Saved') ?? false;
  }

  async hasError(): Promise<boolean> {
    const text = await this.getSaveStateText();
    return text?.includes('Error') ?? false;
  }
}
