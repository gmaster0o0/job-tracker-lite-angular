import { ComponentHarness } from '@angular/cdk/testing';

export class ProgessionStepperHarness extends ComponentHarness {
  static hostSelector = 'app-progession-stepper';

  private readonly getStepButtons = this.locatorForAll('button.h-10');
  private readonly getCompletedChecks = this.locatorForAll(
    'ng-icon[name="lucideCheck"]',
  );

  async clickStep(index: number): Promise<void> {
    const buttons = await this.getStepButtons();
    await buttons[index].click();
  }

  async getCompletedChecksCount(): Promise<number> {
    const checks = await this.getCompletedChecks();
    return checks.length;
  }

  async stepHasRejectedStyling(index: number): Promise<boolean> {
    const buttons = await this.getStepButtons();
    const className = await buttons[index].getAttribute('class');
    return className?.includes('border-red-500') ?? false;
  }
}
