import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';

type DeleteJobAlertDialogContext = {
  onConfirm: () => Promise<void>;
  company: string;
};

@Component({
  standalone: true,
  selector: 'app-delete-job-alert-dialog',
  imports: [CommonModule, HlmAlertDialogImports, HlmButtonImports],
  template: `
    <hlm-alert-dialog-content>
      <hlm-alert-dialog-header>
        <h3 hlmAlertDialogTitle>Are you absolutely sure?</h3>
        <p hlmAlertDialogDescription>
          This action cannot be undone. This will permanently delete the job
          application for
          <span class="font-semibold text-foreground">{{
            context.company
          }}</span>
          and all its associated contacts.
        </p>
      </hlm-alert-dialog-header>
      <hlm-alert-dialog-footer>
        <button hlmBtn variant="outline" (click)="cancel()">Cancel</button>
        <button
          hlmBtn
          variant="destructive"
          [disabled]="isDeleting()"
          (click)="confirm()"
        >
          {{ isDeleting() ? 'Deleting...' : 'Delete Job' }}
        </button>
      </hlm-alert-dialog-footer>
    </hlm-alert-dialog-content>
  `,
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
