import { Component, input } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { provideIcons } from '@ng-icons/core';
import { lucideSave, lucideLoader2 } from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';

@Component({
  standalone: true,
  selector: 'app-job-form-submit-button',
  imports: [HlmButton, HlmIcon],
  providers: [provideIcons({ lucideSave, lucideLoader2 })],
  templateUrl: './job-form-submit-button.component.html',
})
export class JobFormSubmitButtonComponent {
  readonly formId = input.required<string>();
  readonly disabled = input(false);
  readonly isSubmitting = input(false);
  readonly idleLabel = input.required<string>();
  readonly submittingLabel = input('Saving...');
}
