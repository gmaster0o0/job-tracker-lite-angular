import { Component, inject, signal } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import { AccountDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideTrash } from '@ng-icons/lucide';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogContext,
} from '@job-tracker-lite-angular/frontend-shared';
import { deleteJobApplicationsSchema } from '@job-tracker-lite-angular/schemas';
import z from 'zod';
import { CleanupPeriodPickerComponent } from './cleanup-period-picer/cleanup-period-picker.component';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSwitch } from '@spartan-ng/helm/switch';

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [
    HlmTypographyImports,
    TranslocoModule,
    HlmButtonImports,
    HlmIconImports,
    CleanupPeriodPickerComponent,
    HlmSeparator,
    HlmSwitch,
  ],
  providers: [provideIcons({ lucideDownload, lucideTrash })],
  templateUrl: './data-management.component.html',
})
export class DataManagementComponent {
  private readonly accountDataAccess = inject(AccountDataAccessService);
  private readonly hlmDialogService = inject(HlmDialogService);

  protected readonly isExporting = signal(false);

  protected readonly exportLabel = translateSignal(
    'privacySettings.datamanagement.export.label',
  );
  protected readonly deleteLabel = translateSignal(
    'privacySettings.datamanagement.delete.label',
  );
  private readonly dialogTitle = translateSignal(
    'privacySettings.datamanagement.deleteJobs.dialog.title',
  );
  private readonly dialogDescription = translateSignal(
    'privacySettings.datamanagement.deleteJobs.dialog.description',
  );
  private readonly dialogConfirmLabel = translateSignal(
    'privacySettings.datamanagement.deleteJobs.dialog.confirm',
  );
  private readonly dialogCancelLabel = translateSignal(
    'privacySettings.datamanagement.deleteJobs.dialog.cancel',
  );
  private readonly dialogEmailLabel = translateSignal(
    'privacySettings.datamanagement.deleteJobs.dialog.emailLabel',
  );
  private readonly dialogEmailPlaceholder = translateSignal(
    'privacySettings.datamanagement.deleteJobs.dialog.emailPlaceholder',
  );
  private readonly dialogEmailHint = translateSignal(
    'privacySettings.datamanagement.deleteJobs.dialog.emailHint',
  );

  protected async exportUserData(): Promise<void> {
    this.isExporting.set(true);
    try {
      const blob = await this.accountDataAccess.exportUserData();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'export.json';
      link.click();
      window.URL.revokeObjectURL(url);
    } finally {
      this.isExporting.set(false);
    }
  }

  protected openDeleteConfirmation(): void {
    const emailValidationSchema = z.object({
      confirmationValue: deleteJobApplicationsSchema.shape.email,
    });

    this.hlmDialogService.open(ConfirmationDialogComponent, {
      context: {
        title: this.dialogTitle(),
        description: this.dialogDescription(),
        confirmLabel: this.dialogConfirmLabel(),
        cancelLabel: this.dialogCancelLabel(),
        onConfirm: async (email: string) => {
          await this.accountDataAccess.deleteJobApplications({ email });
        },
        field: {
          initialValue: '',
          validationSchema: emailValidationSchema,
          label: this.dialogEmailLabel(),
          placeholder: this.dialogEmailPlaceholder(),
          hint: this.dialogEmailHint(),
          errorTranslationPrefix:
            'privacySettings.datamanagement.deleteJobs.dialog',
        },
      } satisfies ConfirmationDialogContext,
    });
  }

  protected async onCleanupRequested(cutoffDate: Date | null): Promise<void> {
    console.log(cutoffDate);
    // Implement the logic to handle the cleanup request based on the cutoffDate.
    // This could involve calling a service method to delete data older than the cutoffDate.
  }
}
