import { Component, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import {
  HlmAlertDialogDescription,
  HlmAlertDialogFooter,
  HlmAlertDialogHeader,
  HlmAlertDialogTitle,
} from '@spartan-ng/helm/alert-dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogClose } from '@spartan-ng/helm/dialog';

type DeleteConfirmationDialogContext = {
  onConfirm?: () => void | Promise<void>;
  title?: string;
  confirmLabel?: string;
  busyLabel?: string;
  cancelLabel?: string;
  isBusy?: boolean;
};

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
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly context =
    injectBrnDialogContext<DeleteConfirmationDialogContext>({
      optional: true,
    }) ?? {};

  protected readonly title = this.context.title ?? 'Are you sure?';
  protected readonly confirmLabel = this.context.confirmLabel ?? 'Delete';
  protected readonly busyLabel = this.context.busyLabel ?? 'Deleting...';
  protected readonly cancelLabel = this.context.cancelLabel ?? 'Cancel';
  protected readonly isBusy = this.context.isBusy ?? false;
  readonly confirm = output<void>();

  protected async onConfirm(): Promise<void> {
    if (this.context.onConfirm) {
      await this.context.onConfirm();
    }
    this.confirm.emit();
    this.dialogRef?.close();
  }
}
