import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { CreateJobDialogFooterComponent } from './create-job-dialog-footer.component';

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

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Cancel');
    expect(text).toContain('Create');
  });

  it('should show saving label while submitting', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.isSubmitting = true;
    fixture.detectChanges();

    const submitButton = fixture.debugElement.queryAll(By.css('button'))[1]
      .nativeElement as HTMLButtonElement;

    expect(submitButton.textContent).toContain('Saving...');
    expect(submitButton.disabled).toBe(true);
  });
});
