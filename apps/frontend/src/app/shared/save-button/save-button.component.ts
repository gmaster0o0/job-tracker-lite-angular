import { Component, input } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { provideIcons } from '@ng-icons/core';
import { lucideSave, lucideLoader2 } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
  standalone: true,
  selector: 'app-save-button',
  imports: [HlmButton, HlmIconImports],
  providers: [provideIcons({ lucideSave, lucideLoader2 })],
  templateUrl: './save-button.component.html',
})
export class SaveButtonComponent {
  readonly formId = input.required<string>();
  readonly disabled = input(false);
  readonly isSubmitting = input(false);
  readonly idleLabel = input.required<string>();
  readonly submittingLabel = input('Saving...');
}
