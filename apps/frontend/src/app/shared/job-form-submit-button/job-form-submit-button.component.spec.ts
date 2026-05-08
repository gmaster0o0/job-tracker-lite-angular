import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JobFormSubmitButtonComponent } from './job-form-submit-button.component';
import { JobFormSubmitButtonHarness } from './job-form-submit-button.harness';

@Component({
  standalone: true,
  imports: [JobFormSubmitButtonComponent],
  template: `
    <app-job-form-submit-button
      formId="jobForm"
      [disabled]="disabled"
      [isSubmitting]="isSubmitting"
      idleLabel="Create"
      submittingLabel="Saving..."
    />
  `,
})
class HostComponent {
  disabled = false;
  isSubmitting = false;
}

describe('JobFormSubmitButtonComponent', () => {
  let harness: JobFormSubmitButtonHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobFormSubmitButtonHarness,
    );
  });

  it('should render idle label when not submitting', async () => {
    expect(await harness.getLabelText()).toContain('Create');
    expect(await harness.isDisabled()).toBe(false);
    expect(await harness.getFormId()).toBe('jobForm');
  });

  it('should render submitting label and disable button while submitting', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.isSubmitting = true;
    fixture.detectChanges();
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobFormSubmitButtonHarness,
    );

    expect(await localHarness.getLabelText()).toContain('Saving...');
    expect(await localHarness.isDisabled()).toBe(true);
    expect(await localHarness.isSubmittingStateVisible()).toBe(true);
  });
});
