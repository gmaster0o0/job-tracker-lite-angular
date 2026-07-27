import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogClose, HlmDialogFooter } from '@spartan-ng/helm/dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideUndo2 } from '@ng-icons/lucide';
import { SubmitButtonComponent } from '../submit-button/submit-button.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-create-job-dialog-footer',
  imports: [
    HlmDialogFooter,
    HlmButton,
    HlmDialogClose,
    HlmIconImports,
    SubmitButtonComponent,
    TranslocoModule,
  ],
  providers: [provideIcons({ lucideUndo2 })],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './create-job-dialog-footer.component.html',
})
export class CreateJobDialogFooterComponent {
  readonly formId = input.required<string>();
  readonly disableSubmit = input(false);
  readonly isSubmitting = input(false);
}
