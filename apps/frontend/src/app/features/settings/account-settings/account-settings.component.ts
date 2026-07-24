import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  FormField,
  FormRoot,
  form,
  validateStandardSchema,
} from '@angular/forms/signals';
import {
  TranslocoModule,
  TranslocoService,
  translateSignal,
} from '@jsverse/transloco';
import {
  AuthDataAccessService,
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  SaveButtonComponent,
  ServerErrorAlertComponent,
} from '@job-tracker-lite-angular/frontend-shared';
import {
  accountSettingsSchema,
  changeEmailRequestSchema,
  changePasswordSchema,
} from '@job-tracker-lite-angular/schemas';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { provideIcons } from '@ng-icons/core';
import {
  lucideClock,
  lucideEye,
  lucideEyeOff,
  lucideKey,
  lucideMail,
} from '@ng-icons/lucide';
import { interval } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';

const RESEND_DEBOUNCE_MS = 600;

@Component({
  standalone: true,
  selector: 'app-account-settings',
  imports: [
    CommonModule,
    TranslocoModule,
    HlmAlertImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    HlmIconImports,
    FormRoot,
    FormField,
    ZodNgControlBridgeDirective,
    SaveButtonComponent,
    ServerErrorAlertComponent,
  ],
  providers: [
    provideIcons({
      lucideEye,
      lucideEyeOff,
      lucideMail,
      lucideKey,
      lucideClock,
    }),
  ],
  templateUrl: './account-settings.component.html',
})
export class AccountSettingsComponent {
  private readonly authDataAccess = inject(AuthDataAccessService);
  private readonly authService = inject(AuthService);
  private readonly translocoService = inject(TranslocoService);
  private readonly notification = inject(NotificationService);

  protected readonly title = translateSignal('settings.accountSettings.title');
  protected readonly subtitle = translateSignal(
    'settings.accountSettings.subtitle',
  );
  private readonly changeEmailSuccessMessage = translateSignal(
    'settings.accountSettings.changeEmail.success',
  );
  private readonly changePasswordSuccessMessage = translateSignal(
    'settings.accountSettings.changePassword.success',
  );
  private readonly cancelEmailChangeSuccessMessage = translateSignal(
    'settings.accountSettings.changeEmail.cancelSuccess',
  );

  protected readonly accountSettings = signal({
    email: '',
    pendingEmail: null as string | null,
    emailVerified: false,
    pendingEmailRequestedAt: null as Date | null,
    pendingEmailExpiresAt: null as Date | null,
    pendingEmailResendAvailableAt: null as Date | null,
  });

  protected readonly isLoadingSettings = signal(true);

  protected readonly isChangingEmail = signal(false);
  protected readonly changeEmailError = signal<string | null>(null);

  protected readonly isCancelingEmailChange = signal(false);
  protected readonly cancelEmailChangeError = signal<string | null>(null);

  protected readonly isChangingPassword = signal(false);
  protected readonly changePasswordError = signal<string | null>(null);
  protected readonly changePasswordSuccess = signal(false);
  protected readonly isNewPasswordVisible = signal(false);

  protected readonly emailModel = signal({
    newEmail: '',
    language: 'en' as const,
  });

  protected readonly passwordModel = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  private readonly now = signal(new Date());

  /**
   * Debouncer for avoid the flickering resend buttion
   */
  private readonly debouncedTypedEmail = toSignal(
    toObservable(computed(() => this.emailModel().newEmail)).pipe(
      debounceTime(RESEND_DEBOUNCE_MS),
    ),
    { initialValue: '' },
  );

  /**
   * Whether the currently typed address matches the pending target. The
   * cooldown itself is always derived from the server's sentAt-based
   * pendingEmailResendAvailableAt (below), not from client-side timer state,
   * so re-typing the same pending address can't be used to bypass it.
   */
  protected readonly isResendMode = computed(() => {
    const pendingEmail = this.accountSettings().pendingEmail;
    if (!pendingEmail) {
      return false;
    }
    return (
      this.debouncedTypedEmail().trim().toLowerCase() ===
      pendingEmail.trim().toLowerCase()
    );
  });

  protected readonly remainingResendCooldownSeconds = computed(() => {
    if (!this.isResendMode()) {
      return 0;
    }
    const resendAvailableAt =
      this.accountSettings().pendingEmailResendAvailableAt;
    if (!resendAvailableAt) {
      return 0;
    }
    const remainingMs = resendAvailableAt.getTime() - this.now().getTime();
    return Math.max(0, Math.ceil(remainingMs / 1000));
  });

  protected readonly isResendOnCooldown = computed(
    () => this.remainingResendCooldownSeconds() > 0,
  );

  protected readonly formattedPendingEmailSentAt = computed(() => {
    const requestedAt = this.accountSettings().pendingEmailRequestedAt;
    return requestedAt ? this.formatShortDateTime(requestedAt) : null;
  });

  protected readonly formattedPendingEmailExpiresAt = computed(() => {
    const expiresAt = this.accountSettings().pendingEmailExpiresAt;
    return expiresAt ? this.formatShortDateTime(expiresAt) : null;
  });

  protected readonly formattedPendingEmailExpiresRelative = computed(() => {
    const expiresAt = this.accountSettings().pendingEmailExpiresAt;
    return expiresAt ? this.formatRelativeTime(expiresAt) : null;
  });

  protected readonly changeEmailForm = form(
    this.emailModel,
    (path) => validateStandardSchema(path, changeEmailRequestSchema),
    {
      submission: {
        action: async (data) => {
          this.isChangingEmail.set(true);
          this.changeEmailError.set(null);

          const language =
            this.translocoService.getActiveLang() === 'hu' ? 'hu' : 'en';

          try {
            await this.authDataAccess.requestEmailChange({
              ...data().value(),
              language,
            });
            this.notification.success(this.changeEmailSuccessMessage());
            await this.loadSettings();
          } catch (error) {
            this.changeEmailError.set(
              isBackendError(error) ? error.errorCode.toLowerCase() : 'unknown',
            );
          } finally {
            this.isChangingEmail.set(false);
          }
        },
      },
    },
  );

  protected readonly changePasswordForm = form(
    this.passwordModel,
    (path) => validateStandardSchema(path, changePasswordSchema),
    {
      submission: {
        action: async (data) => {
          this.isChangingPassword.set(true);
          this.changePasswordError.set(null);
          this.changePasswordSuccess.set(false);

          try {
            await this.authDataAccess.changePassword(data().value());
            this.changePasswordSuccess.set(true);
            this.notification.success(this.changePasswordSuccessMessage());
            // Clear the form values and reset the form state so validation
            // errors do not appear immediately after a successful submit.
            this.passwordModel.set({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
            this.changePasswordForm.currentPassword().reset();
            this.changePasswordForm.newPassword().reset();
            this.changePasswordForm.confirmPassword().reset();
            await this.authService.handleLogout({
              passwordChanged: true,
            });
          } catch (error) {
            this.changePasswordError.set(
              isBackendError(error) ? error.errorCode.toLowerCase() : 'unknown',
            );
          } finally {
            this.isChangingPassword.set(false);
          }
        },
      },
    },
  );

  constructor() {
    void this.loadSettings();

    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.now.set(new Date()));
  }

  protected toggleNewPasswordVisibility(): void {
    this.isNewPasswordVisible.update((v) => !v);
  }

  protected async onCancelEmailChange(): Promise<void> {
    this.isCancelingEmailChange.set(true);
    this.cancelEmailChangeError.set(null);

    try {
      await this.authDataAccess.cancelEmailChange();
      const current = this.accountSettings();
      this.accountSettings.set({
        ...current,
        pendingEmail: null,
        pendingEmailRequestedAt: null,
        pendingEmailExpiresAt: null,
        pendingEmailResendAvailableAt: null,
      });
      this.notification.success(this.cancelEmailChangeSuccessMessage());
    } catch (error) {
      this.cancelEmailChangeError.set(
        isBackendError(error) ? error.errorCode.toLowerCase() : 'unknown',
      );
    } finally {
      this.isCancelingEmailChange.set(false);
    }
  }

  private getLocale(): string {
    return this.translocoService.getActiveLang() === 'hu' ? 'hu-HU' : 'en-US';
  }

  private formatShortDateTime(date: Date): string {
    return new Intl.DateTimeFormat(this.getLocale(), {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private formatRelativeTime(target: Date): string {
    const diffMs = target.getTime() - this.now().getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const rtf = new Intl.RelativeTimeFormat(this.getLocale(), {
      numeric: 'auto',
    });

    if (Math.abs(diffHours) >= 24) {
      return rtf.format(Math.round(diffHours / 24), 'day');
    }
    return rtf.format(Math.round(diffHours), 'hour');
  }

  private async loadSettings(): Promise<void> {
    this.isLoadingSettings.set(true);
    try {
      const response = await this.authDataAccess.getAccountSettings();
      const parsed = accountSettingsSchema.safeParse(response);
      if (parsed.success) {
        this.accountSettings.set(parsed.data);

        // Prefill the field with the pending target so a reload (or the
        // initial load) lands in Resend mode instead of showing an empty
        // field with an enabled Save button for a request that's already
        // in flight. A no-op once the field already holds this value (e.g.
        // right after submitting).
        if (parsed.data.pendingEmail && !this.emailModel().newEmail) {
          this.emailModel.set({
            ...this.emailModel(),
            newEmail: parsed.data.pendingEmail,
          });
        }
      }
    } finally {
      this.isLoadingSettings.set(false);
    }
  }
}
