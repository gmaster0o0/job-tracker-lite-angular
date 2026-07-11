import { Component, inject, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import {
  AccountDataAccessService,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  DeleteConfirmationDialogComponent,
  ServerErrorAlertComponent,
} from '@job-tracker-lite-angular/frontend-shared';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [
    TranslocoModule,
    HlmButtonImports,
    HlmAlertImports,
    HlmIconImports,
    HlmTypographyImports,
    ServerErrorAlertComponent,
  ],
  providers: [provideIcons({ lucideTrash2 })],
  templateUrl: './delete-account.component.html',
})
export class DeleteAccountComponent {
  private readonly accountDataAccess = inject(AccountDataAccessService);
  private readonly translocoService = inject(TranslocoService);
  private readonly hlmDialogService = inject(HlmDialogService);

  protected readonly isDeleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly confirmationSent = signal(false);

  protected onDeleteAccount(): void {
    this.hlmDialogService.open(DeleteConfirmationDialogComponent, {
      contentClass: 'sm:max-w-xl !sm:mx-auto',
      context: {
        title: this.translocoService.translate(
          'privacySettings.deleteAccount.dialogTitle',
        ),
        description: this.translocoService.translate(
          'privacySettings.deleteAccount.dialogDescription',
        ),
        confirmLabel: this.translocoService.translate(
          'privacySettings.deleteAccount.button',
        ),
        variant: 'destructive',
        isBusy: this.isDeleting(),
        onConfirm: async () => {
          this.isDeleting.set(true);
          this.deleteError.set(null);

          const language =
            this.translocoService.getActiveLang() === 'hu' ? 'hu' : 'en';

          try {
            await this.accountDataAccess.requestAccountDeletion({ language });
            this.confirmationSent.set(true);
          } catch (error) {
            this.deleteError.set(
              isBackendError(error) ? error.errorCode : 'unknown',
            );
          } finally {
            this.isDeleting.set(false);
          }
        },
      },
    });
  }
}
