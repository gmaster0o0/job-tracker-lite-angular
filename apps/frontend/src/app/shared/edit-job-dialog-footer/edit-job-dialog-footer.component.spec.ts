import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { EditJobDialogFooterComponent } from './edit-job-dialog-footer.component';

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
      imports: [HostComponent],
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
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Cancel');
    expect(text).toContain('Save Changes');
  });

  it('should disable submit button when disabled by input', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.disableSubmit = true;
    fixture.detectChanges();

    const submitButton = fixture.debugElement.queryAll(By.css('button'))[1]
      .nativeElement as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);
  });
});
