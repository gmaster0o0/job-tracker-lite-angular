import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SaveButtonComponent } from './save-button.component';
import { SaveButtonHarness } from './save-button.harness';

@Component({
  standalone: true,
  imports: [SaveButtonComponent],
  template: `
    <app-save-button
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

describe('SaveButtonComponent', () => {
  let harness: SaveButtonHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SaveButtonHarness,
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
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SaveButtonHarness,
    );

    expect(await localHarness.getLabelText()).toContain('Saving...');
    expect(await localHarness.isDisabled()).toBe(true);
    expect(await localHarness.isSubmittingStateVisible()).toBe(true);
  });
});
