import { Component, computed, inject, signal } from '@angular/core';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import {
  TranslocoModule,
  translate,
  translateSignal,
} from '@jsverse/transloco';
import {
  AccountDataAccessService,
  NotificationService,
} from '@job-tracker-lite-angular/frontend-data-access';
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
  private readonly authSessionService = inject(AuthSessionService);
  private readonly hlmDialogService = inject(HlmDialogService);
  private readonly notification = inject(NotificationService);

  private readonly exportSuccessMessage = translateSignal(
    'privacySettings.datamanagement.export.success',
    { defaultValue: 'Data exported successfully' },
  );
  private readonly deleteSuccessMessage = translateSignal(
    'privacySettings.datamanagement.delete.success',
    { defaultValue: 'Jobs deleted successfully' },
  );

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

  private readonly cutOffDate = signal<string>('2025.11.11.');

  private readonly dialogDescription = computed(() => {
    const cutoff = this.cutOffDate();
    const today = new Date().toLocaleDateString('hu-HU');

    const mode = cutoff === today ? 'all' : 'date';

    return translate(
      'privacySettings.datamanagement.deleteJobs.dialog.description',
      { mode: mode, date: cutoff },
    );
  });
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
      link.download = this.generateExportFileName();
      link.click();
      window.URL.revokeObjectURL(url);
      this.notification.success(this.exportSuccessMessage());
    } finally {
      this.isExporting.set(false);
    }
  }

  protected openDeleteConfirmation(cutoffDate: Date): void {
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
          await this.accountDataAccess.deleteJobApplications({
            email,
            cutoffDate,
          });
          this.notification.success(this.deleteSuccessMessage());
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

  protected async onCleanupRequested(cutoffDate: Date): Promise<void> {
    this.cutOffDate.set(
      cutoffDate ? cutoffDate.toLocaleDateString('hu-HU') : '',
    );

    this.openDeleteConfirmation(cutoffDate);
  }

  private generateExportFileName(): string {
    const session = this.authSessionService.session();

    // get username or fallback to email prefix if username is not available
    let username = session?.user.name;
    if (!username && session?.user.email) {
      username = session.user.email.split('@')[0];
    }

    //fallback to a default username if both name and email are unavailable
    const finalUsername = username || 'user';

    const safeUsername = finalUsername
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    const now = new Date();

    //Forcing the date to be in the format "YYYY-MM-DD-HHMMSS" without any spaces or special characters
    const formatter = new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const localDateTimeString = formatter.format(now);
    const safeDateTimeString = localDateTimeString
      .replace(/[\s:]/g, '')
      .replace(/[,.]/g, '-');

    return `jobtracker-${safeUsername}-${safeDateTimeString}.json`;
  }
}
