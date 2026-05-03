import { Component, input } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  standalone: true,
  selector: 'app-job-form-submit-button',
  imports: [HlmButton],
  templateUrl: './job-form-submit-button.component.html',
})
export class JobFormSubmitButtonComponent {
  readonly formId = input.required<string>();
  readonly disabled = input(false);
  readonly isSubmitting = input(false);
  readonly idleLabel = input.required<string>();
  readonly submittingLabel = input('Saving...');
}
