import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { EditJobDialogFooterComponent } from './edit-job-dialog-footer.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { EditJobDialogFooterHarness } from './edit-job-dialog-footer.harness';

@Component({
  standalone: true,
  imports: [EditJobDialogFooterComponent],
  template: `
    <app-edit-job-dialog-footer
      formId="editJobForm"
      [disableSubmit]="disableSubmit"
      [isSubmitting]="isSubmitting"
    />
  `,
})
class HostComponent {
  disableSubmit = false;
  isSubmitting = false;
}

describe('EditJobDialogFooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, getTranslocoModule()],
      providers: [
        {
          provide: BrnDialogRef,
          useValue: {
            close: () => {
              // empty
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should render cancel and save actions', () => {
    const fixture = TestBed.createComponent(HostComponent);
    return TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditJobDialogFooterHarness,
    ).then(async (harness) => {
      const text = await harness.getTextContent();
      expect(text).toContain('Cancel');
      expect(text).toContain('Save Changes');
    });
  });

  it('should disable submit button when disabled by input', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.disableSubmit = true;

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditJobDialogFooterHarness,
    );

    expect(await harness.isSubmitDisabled()).toBe(true);
  });
});
