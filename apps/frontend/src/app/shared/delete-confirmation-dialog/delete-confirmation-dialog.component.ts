import { Component, input, output } from '@angular/core';
import {
  HlmAlertDialogDescription,
  HlmAlertDialogFooter,
  HlmAlertDialogHeader,
  HlmAlertDialogTitle,
} from '@spartan-ng/helm/alert-dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogClose } from '@spartan-ng/helm/dialog';

@Component({
  standalone: true,
  selector: 'app-delete-confirmation-dialog',
  imports: [
    HlmAlertDialogDescription,
    HlmAlertDialogFooter,
    HlmAlertDialogHeader,
    HlmAlertDialogTitle,
    HlmButton,
    HlmDialogClose,
  ],
  templateUrl: './delete-confirmation-dialog.component.html',
})
export class DeleteConfirmationDialogComponent {
  readonly title = input('Are you sure?');
  readonly confirmLabel = input('Delete');
  readonly busyLabel = input('Deleting...');
  readonly cancelLabel = input('Cancel');
  readonly isBusy = input(false);
  readonly confirm = output<void>();
}
