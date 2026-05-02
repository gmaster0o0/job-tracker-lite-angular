import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

type DeleteContactAlertDialogContext = {
  onConfirm: () => Promise<void>;
  contactName: string;
};

@Component({
  standalone: true,
  selector: 'app-delete-contact-alert-dialog',
  imports: [CommonModule, HlmAlertDialogImports],
  templateUrl: './delete-contact-alert-dialog.component.html',
})
export class DeleteContactAlertDialogComponent {
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  protected readonly context =
    injectBrnDialogContext<DeleteContactAlertDialogContext>({
      optional: true,
    }) ?? {
      contactName: 'this contact',
      onConfirm: async () => undefined,
    };

  protected readonly isDeleting = signal(false);

  protected cancel(): void {
    this.dialogRef?.close();
  }

  protected async confirm(): Promise<void> {
    if (this.isDeleting()) return;
    this.isDeleting.set(true);
    try {
      await this.context.onConfirm();
      this.dialogRef?.close(true);
    } finally {
      this.isDeleting.set(false);
    }
  }
}
