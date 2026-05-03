import { Component, inject, signal } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { DeleteConfirmationDialogComponent } from '../../../shared';

type DeleteJobAlertDialogContext = {
  onConfirm: () => Promise<void>;
  company: string;
};

@Component({
  standalone: true,
  selector: 'app-delete-job-alert-dialog',
  imports: [DeleteConfirmationDialogComponent],
  templateUrl: './delete-job-alert-dialog.component.html',
})
export class DeleteJobAlertDialogComponent {
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  protected readonly context =
    injectBrnDialogContext<DeleteJobAlertDialogContext>({
      optional: true,
    }) ?? {
      company: 'this job',
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
