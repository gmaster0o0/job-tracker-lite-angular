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

  async function renderStepper(options: {
    activeIndex: number;
    errorState?: boolean;
    disabled?: boolean;
  }) {
    const fixture = TestBed.createComponent(ProgessionStepperComponent);
    fixture.componentRef.setInput('labels', labels);
    fixture.componentRef.setInput('activeIndex', options.activeIndex);
    fixture.componentRef.setInput('errorState', options.errorState ?? false);
    fixture.componentRef.setInput('disabled', options.disabled ?? false);

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ProgessionStepperHarness,
    );

    return { fixture, harness };
  }

  it('should render completed steps up to current status', async () => {
    const { harness } = await renderStepper({ activeIndex: 2 });

    expect(await harness.getCompletedChecksCount()).toBe(3);
  });

  it('should emit selected status when a step is clicked', async () => {
    const { fixture, harness } = await renderStepper({ activeIndex: 0 });

    const emitted: number[] = [];
    fixture.componentInstance.stepSelected.subscribe((index) =>
      emitted.push(index),
    );

    await harness.clickStep(1);

    expect(emitted).toEqual([1]);
  });

  it('should show rejected styling and no completed checks when rejected', async () => {
    const { harness } = await renderStepper({
      activeIndex: -1,
      errorState: true,
    });

    expect(await harness.getCompletedChecksCount()).toBe(0);
    expect(await harness.stepHasRejectedStyling(0)).toBe(true);
  });

  describe('step styling', () => {
    it('should mark completed steps with the primary tokens', async () => {
      const { harness } = await renderStepper({ activeIndex: 2 });

      const classes = await harness.getStepClasses(0);

      expect(classes).toContain('border-primary');
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-primary-foreground');
    });

    it('should mark upcoming steps with the neutral tokens', async () => {
      const { harness } = await renderStepper({ activeIndex: 0 });

      const classes = await harness.getStepClasses(3);

      expect(classes).toContain('border-border');
      expect(classes).toContain('bg-background');
      expect(classes).toContain('text-muted-foreground');
      expect(classes).not.toContain('bg-primary');
    });

    it('should mark every step destructive when in the error state', async () => {
      const { harness } = await renderStepper({
        activeIndex: 2,
        errorState: true,
      });

      // The error state wins over completion, so even a step that would
      // otherwise be completed renders destructive.
      const classes = await harness.getStepClasses(0);

      expect(classes).toContain('border-destructive');
      expect(classes).toContain('bg-destructive/10');
      expect(classes).toContain('text-destructive');
      expect(classes).not.toContain('bg-primary');
    });

    it('should ring only the current step', async () => {
      const { harness } = await renderStepper({ activeIndex: 1 });

      expect(await harness.getStepClasses(1)).toContain('ring-4');
      expect(await harness.getStepClasses(0)).not.toContain('ring-4');
      expect(await harness.getStepClasses(2)).not.toContain('ring-4');
    });

    it('should not ring the current step while in the error state', async () => {
      const { harness } = await renderStepper({
        activeIndex: 1,
        errorState: true,
      });

      expect(await harness.getStepClasses(1)).not.toContain('ring-4');
    });
  });

  describe('label styling', () => {
    it('should emphasise labels of completed steps', async () => {
      const { harness } = await renderStepper({ activeIndex: 1 });

      const classes = await harness.getLabelClasses(0);

      expect(classes).toContain('text-foreground');
      // hlm() merges via tailwind-merge, so the conflicting base colour is
      // dropped rather than both classes being emitted.
      expect(classes).not.toContain('text-muted-foreground');
    });

    it('should keep labels of upcoming steps muted', async () => {
      const { harness } = await renderStepper({ activeIndex: 1 });

      const classes = await harness.getLabelClasses(3);

      expect(classes).toContain('text-muted-foreground');
    });

    it('should keep every label muted while in the error state', async () => {
      const { harness } = await renderStepper({
        activeIndex: 2,
        errorState: true,
      });

      expect(await harness.getLabelClasses(0)).toContain(
        'text-muted-foreground',
      );
    });
  });

  describe('connector styling', () => {
    it('should render one connector fewer than the labels', async () => {
      const { harness } = await renderStepper({ activeIndex: 0 });

      expect(await harness.getConnectorCount()).toBe(labels.length - 1);
    });

    it('should fill connectors behind the active step', async () => {
      const { harness } = await renderStepper({ activeIndex: 2 });

      expect(await harness.getConnectorClasses(0)).toContain('bg-primary');
      expect(await harness.getConnectorClasses(1)).toContain('bg-primary');
    });

    it('should leave the connector at the active step unfilled', async () => {
      const { harness } = await renderStepper({ activeIndex: 2 });

      const classes = await harness.getConnectorClasses(2);

      expect(classes).toContain('bg-border');
      expect(classes).not.toContain('bg-primary');
    });

    it('should render every connector destructive in the error state', async () => {
      const { harness } = await renderStepper({
        activeIndex: 2,
        errorState: true,
      });

      const classes = await harness.getConnectorClasses(0);

      expect(classes).toContain('bg-destructive/40');
      expect(classes).not.toContain('bg-primary');
    });
  });
});
