import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { CreateJobDialogFooterComponent } from './create-job-dialog-footer.component';
import { CreateJobDialogFooterHarness } from './create-job-dialog-footer.harness';

@Component({
  standalone: true,
  imports: [CreateJobDialogFooterComponent],
  template: `
    <app-create-job-dialog-footer
      formId="createJobForm"
      [disableSubmit]="disableSubmit"
      [isSubmitting]="isSubmitting"
    />
  `,
})
class HostComponent {
  disableSubmit = false;
  isSubmitting = false;
}

describe('CreateJobDialogFooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: BrnDialogRef,
          useValue: {
            close: () => {
              //empty
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should render cancel and create actions', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    return TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateJobDialogFooterHarness,
    ).then(async (harness) => {
      const text = await harness.getTextContent();
      expect(text).toContain('Cancel');
      expect(text).toContain('Create');
    });
  });

  it('should show saving label while submitting', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.isSubmitting = true;
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateJobDialogFooterHarness,
    );

    expect(await harness.getSubmitLabelText()).toContain('Saving...');
    expect(await harness.isSubmitDisabled()).toBe(true);
  });
});
