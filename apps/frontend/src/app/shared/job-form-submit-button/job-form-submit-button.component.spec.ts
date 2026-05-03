import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JobFormSubmitButtonComponent } from './job-form-submit-button.component';

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
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('should render idle label when not submitting', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;

    expect(button.textContent).toContain('Create');
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('form')).toBe('jobForm');
  });

  it('should render submitting label and disable button while submitting', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.isSubmitting = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;

    expect(button.textContent).toContain('Saving...');
    expect(button.disabled).toBe(true);
  });
});
