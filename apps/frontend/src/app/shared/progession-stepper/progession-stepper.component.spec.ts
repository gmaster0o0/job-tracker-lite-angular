import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ProgessionStepperComponent } from './progession-stepper.component';
import { jobStepperLabels } from '@job-tracker-lite-angular/testing';
import { ProgessionStepperHarness } from './progession-stepper.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('ProgessionStepperComponent', () => {
  const labels = jobStepperLabels;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgessionStepperComponent, getTranslocoModule()],
    }).compileComponents();
  });

  it('should render completed steps up to current status', () => {
    const fixture = TestBed.createComponent(ProgessionStepperComponent);
    fixture.componentRef.setInput('labels', labels);
    fixture.componentRef.setInput('activeIndex', 2);

    return TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ProgessionStepperHarness,
    ).then(async (harness) => {
      expect(await harness.getCompletedChecksCount()).toBe(3);
    });
  });

  it('should emit selected status when a step is clicked', async () => {
    const fixture = TestBed.createComponent(ProgessionStepperComponent);
    fixture.componentRef.setInput('labels', labels);
    fixture.componentRef.setInput('activeIndex', 0);

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ProgessionStepperHarness,
    );

    const emitted: number[] = [];
    fixture.componentInstance.stepSelected.subscribe((index) =>
      emitted.push(index),
    );

    await harness.clickStep(1);

    expect(emitted).toEqual([1]);
  });

  it('should show rejected styling and no completed checks when rejected', async () => {
    const fixture = TestBed.createComponent(ProgessionStepperComponent);
    fixture.componentRef.setInput('labels', labels);
    fixture.componentRef.setInput('activeIndex', -1);
    fixture.componentRef.setInput('errorState', true);

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ProgessionStepperHarness,
    );

    expect(await harness.getCompletedChecksCount()).toBe(0);
    expect(await harness.stepHasRejectedStyling(0)).toBe(true);
  });
});
