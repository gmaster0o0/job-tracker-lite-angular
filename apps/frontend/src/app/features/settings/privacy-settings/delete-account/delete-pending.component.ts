import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import {
  AccountDataAccessService,
  AuthSessionService,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  DeleteConfirmationDialogComponent,
  ServerErrorAlertComponent,
} from '@job-tracker-lite-angular/frontend-shared';
import { interval } from 'rxjs';

@Component({
  selector: 'app-delete-pending',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslocoModule,
    HlmCardImports,
    HlmButtonImports,
    ServerErrorAlertComponent,
  ],
  templateUrl: './delete-pending.component.html',
})
export class DeletePendingComponent {
  private readonly accountDataAccess = inject(AccountDataAccessService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly translocoService = inject(TranslocoService);
  private readonly dialogService = inject(HlmDialogService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(true);
  protected readonly isRecovering = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly now = signal(new Date());
  protected readonly scheduledDeletionAt = signal<Date | null>(null);

  protected readonly remainingMs = computed(() => {
    const scheduled = this.scheduledDeletionAt();
    if (!scheduled) {
      return 0;
    }

    return Math.max(scheduled.getTime() - this.now().getTime(), 0);
  });

  protected readonly remainingDays = computed(() =>
    Math.floor(this.remainingMs() / (1000 * 60 * 60 * 24)),
  );

  protected readonly remainingHours = computed(() =>
    Math.floor((this.remainingMs() % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
  );

  protected readonly remainingMinutes = computed(() =>
    Math.floor((this.remainingMs() % (1000 * 60 * 60)) / (1000 * 60)),
  );

  constructor() {
    this.refreshStatus();

    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.now.set(new Date()));
  }

  protected onRecover(): void {
    this.dialogService.open(DeleteConfirmationDialogComponent, {
      contentClass: 'sm:max-w-xl !sm:mx-auto',
      context: {
        title: this.translocoService.translate(
          'privacySettings.deletePending.recoverDialogTitle',
        ),
        description: this.translocoService.translate(
          'privacySettings.deletePending.recoverDialogDescription',
        ),
        confirmLabel: this.translocoService.translate(
          'privacySettings.deletePending.recoverButton',
        ),
        variant: 'default',
        isBusy: this.isRecovering(),
        onConfirm: async () => {
          this.isRecovering.set(true);
          this.error.set(null);

          try {
            await this.accountDataAccess.recoverAccountDeletion();
            await this.authSessionService.loadSession();
            await this.router.navigate(['/settings/privacy'], {
              queryParams: { accountDeletion: 'recovered' },
            });
          } catch (apiError) {
            this.error.set(
              isBackendError(apiError) ? apiError.errorCode : 'unknown',
            );
          } finally {
            this.isRecovering.set(false);
          }
        },
      },
    });
  }

  private async refreshStatus(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const status = await this.accountDataAccess.getDeletionStatus();

      if (status.status !== 'pending_deletion' || !status.scheduledDeletionAt) {
        // Guard will handle route blocking for non-pending users; leave component to render or be unused.
        return;
      }

      this.scheduledDeletionAt.set(new Date(status.scheduledDeletionAt));
    } catch (apiError) {
      this.error.set(isBackendError(apiError) ? apiError.errorCode : 'unknown');
    } finally {
      this.isLoading.set(false);
    }
  }
}
