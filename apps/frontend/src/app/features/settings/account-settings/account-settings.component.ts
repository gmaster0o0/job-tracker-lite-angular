import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  validateStandardSchema,
} from '@angular/forms/signals';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
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

  protected readonly title = translateSignal('settings.accountSettings.title');
  protected readonly subtitle = translateSignal(
    'settings.accountSettings.subtitle',
  );

  protected readonly accountSettings = signal({
    email: '',
    pendingEmail: null as string | null,
    emailVerified: false,
  });

  protected readonly isLoadingSettings = signal(true);

  private readonly accountSettingsResource =
    this.authDataAccess.accountSettings;
  private readonly sessionResource = this.authDataAccess.session;

  protected readonly isChangingEmail = signal(false);
  protected readonly changeEmailError = signal<string | null>(null);
  protected readonly changeEmailSuccess = signal(false);

  protected readonly isChangingPassword = signal(false);
  protected readonly changePasswordError = signal<string | null>(null);
  protected readonly changePasswordSuccess = signal(false);
  protected readonly isNewPasswordVisible = signal(false);

  protected readonly emailModel = signal({
    newEmail: '',
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

          try {
            await this.authDataAccess.requestEmailChange(data().value());
            this.changeEmailSuccess.set(true);

            const current = this.accountSettings();
            this.accountSettings.set({
              ...current,
              pendingEmail: data().value().newEmail,
            });
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
            this.passwordModel.set({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
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
    this.accountSettingsResource.reload();
    this.sessionResource.reload();

    effect(() => {
      const response = this.accountSettingsResource.value();
      if (response) {
        const parsed = accountSettingsSchema.safeParse(response);
        if (parsed.success) {
          this.accountSettings.set(parsed.data);
        }
        this.isLoadingSettings.set(false);
        return;
      }

      if (this.accountSettingsResource.error()) {
        const session = this.sessionResource.value();
        if (session?.user?.email) {
          const current = this.accountSettings();
          this.accountSettings.set({
            ...current,
            email: session.user.email,
            emailVerified: session.user.emailVerified,
          });
        }
        this.isLoadingSettings.set(false);
      }
    });
  }

  protected toggleNewPasswordVisibility(): void {
    this.isNewPasswordVisible.update((v) => !v);
  }
}
