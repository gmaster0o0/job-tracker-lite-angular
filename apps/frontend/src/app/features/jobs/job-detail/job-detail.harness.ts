import { ComponentHarness } from '@angular/cdk/testing';
import { ProgessionStepperHarness } from '../../../shared/progession-stepper/progession-stepper.harness';

export class JobDetailHarness extends ComponentHarness {
  static hostSelector = 'app-job-detail';

  private readonly getStepper = this.locatorFor(ProgessionStepperHarness);

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }

  async clickProgressStep(index: number): Promise<void> {
    const stepper = await this.getStepper();
    await stepper.clickStep(index);
  }
}
