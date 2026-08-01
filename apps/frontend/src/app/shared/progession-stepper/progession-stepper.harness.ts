import { ComponentHarness } from '@angular/cdk/testing';

export class ProgessionStepperHarness extends ComponentHarness {
  static hostSelector = 'app-progession-stepper';

  private readonly getStepButtons = this.locatorForAll(
    '[data-testid="stepper-step"]',
  );
  private readonly getLabelButtons = this.locatorForAll(
    '[data-testid="stepper-label"]',
  );
  private readonly getConnectors = this.locatorForAll(
    '[data-testid="stepper-connector"]',
  );
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

  async getStepClasses(index: number): Promise<string> {
    const buttons = await this.getStepButtons();
    return (await buttons[index].getAttribute('class')) ?? '';
  }

  async getLabelClasses(index: number): Promise<string> {
    const labels = await this.getLabelButtons();
    return (await labels[index].getAttribute('class')) ?? '';
  }

  async getConnectorClasses(index: number): Promise<string> {
    const connectors = await this.getConnectors();
    return (await connectors[index].getAttribute('class')) ?? '';
  }

  async getConnectorCount(): Promise<number> {
    const connectors = await this.getConnectors();
    return connectors.length;
  }

  async stepHasRejectedStyling(index: number): Promise<boolean> {
    return (await this.getStepClasses(index)).includes('border-destructive');
  }
}
