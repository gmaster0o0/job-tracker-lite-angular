import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { provideIcons } from '@ng-icons/core';
import {
  lucideEye,
  lucideEyeOff,
  lucideKey,
  lucideMail,
} from '@ng-icons/lucide';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';

@Component({
  standalone: true,
  selector: 'app-account-settings',
  imports: [
    CommonModule,
    TranslocoModule,
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
  providers: [provideIcons({ lucideEye, lucideEyeOff, lucideMail, lucideKey })],
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
  });

  protected readonly isLoadingSettings = signal(true);

  protected readonly isChangingEmail = signal(false);
  protected readonly changeEmailError = signal<string | null>(null);
  protected readonly changeEmailSuccess = signal(false);

  protected readonly isCancelingEmailChange = signal(false);
  protected readonly cancelEmailChangeError = signal<string | null>(null);

  protected readonly formattedPendingEmailRequestedAt = computed(() => {
    const requestedAt = this.accountSettings().pendingEmailRequestedAt;
    return requestedAt ? this.formatDateTime(requestedAt) : null;
  });

  protected readonly formattedPendingEmailExpiresAt = computed(() => {
    const expiresAt = this.accountSettings().pendingEmailExpiresAt;
    return expiresAt ? this.formatDateTime(expiresAt) : null;
  });

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

  protected readonly changeEmailForm = form(
    this.emailModel,
    (path) => validateStandardSchema(path, changeEmailRequestSchema),
    {
      submission: {
        action: async (data) => {
          this.isChangingEmail.set(true);
          this.changeEmailError.set(null);
          this.changeEmailSuccess.set(false);

          const language =
            this.translocoService.getActiveLang() === 'hu' ? 'hu' : 'en';

          try {
            await this.authDataAccess.requestEmailChange({
              ...data().value(),
              language,
            });
            this.changeEmailSuccess.set(true);
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
  }

  protected toggleNewPasswordVisibility(): void {
    this.isNewPasswordVisible.update((v) => !v);
  }

  protected async onCancelEmailChange(): Promise<void> {
    this.isCancelingEmailChange.set(true);
    this.cancelEmailChangeError.set(null);

    try {
      await this.authDataAccess.cancelEmailChange();
      this.changeEmailSuccess.set(false);
      const current = this.accountSettings();
      this.accountSettings.set({
        ...current,
        pendingEmail: null,
        pendingEmailRequestedAt: null,
        pendingEmailExpiresAt: null,
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

  private formatDateTime(date: Date): string {
    const locale =
      this.translocoService.getActiveLang() === 'hu' ? 'hu-HU' : 'en-US';

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  }

  private async loadSettings(): Promise<void> {
    this.isLoadingSettings.set(true);
    try {
      const response = await this.authDataAccess.getAccountSettings();
      const parsed = accountSettingsSchema.safeParse(response);
      if (parsed.success) {
        this.accountSettings.set(parsed.data);
      }
    } finally {
      this.isLoadingSettings.set(false);
    }
  }
}
