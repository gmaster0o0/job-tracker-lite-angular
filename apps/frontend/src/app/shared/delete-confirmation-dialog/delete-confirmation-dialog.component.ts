import { Component, inject, input, output } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideUndo2, lucideTrash } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogClose } from '@spartan-ng/helm/dialog';

type DeleteConfirmationDialogContext = {
  onConfirm?: () => void | Promise<void>;
  title?: string;
  confirmLabel?: string;
  busyLabel?: string;
  cancelLabel?: string;
  description?: string;
  isBusy?: boolean;
};

@Component({
  standalone: true,
  selector: 'app-delete-confirmation-dialog',
  imports: [HlmAlertDialogImports, HlmButton, HlmDialogClose, HlmIconImports],
  providers: [provideIcons({ lucideUndo2, lucideTrash })],
  templateUrl: './delete-confirmation-dialog.component.html',
})
export class DeleteConfirmationDialogComponent {
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly context =
    injectBrnDialogContext<DeleteConfirmationDialogContext>({
      optional: true,
    }) ?? {};

  readonly isBusy = input<boolean>(false);

  protected readonly title = this.context.title ?? 'Are you sure?';
  protected readonly confirmLabel = this.context.confirmLabel ?? 'Delete';
  protected readonly busyLabel = this.context.busyLabel ?? 'Deleting...';
  protected readonly cancelLabel = this.context.cancelLabel ?? 'Cancel';
  protected readonly description = this.context.description ?? null;
  protected readonly effectiveIsBusy =
    this.isBusy() || (this.context.isBusy ?? false);
  readonly confirm = output<void>();

  protected async onConfirm(): Promise<void> {
    if (this.context.onConfirm) {
      await this.context.onConfirm();
    }
    this.confirm.emit();
    this.dialogRef?.close();
  }
}
