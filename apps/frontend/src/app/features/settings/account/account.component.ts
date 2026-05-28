import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  validateStandardSchema,
} from '@angular/forms/signals';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideCheckCircle2 } from '@ng-icons/lucide';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import {
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import { ServerErrorAlertComponent } from '@job-tracker-lite-angular/frontend-shared';
import { changePasswordSchema } from '@job-tracker-lite-angular/schemas';
import { AuthStore } from '../../auth/auth.store';

@Component({
  standalone: true,
  selector: 'app-account-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    HlmAlertImports,
    HlmIconImports,
    FormRoot,
    FormField,
    ZodNgControlBridgeDirective,
    ServerErrorAlertComponent,
  ],
  providers: [provideIcons({ lucideCheckCircle2 })],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  private readonly authStore = inject(AuthStore);

  protected readonly title = translateSignal('auth.account.title');
  protected readonly description = translateSignal('auth.account.description');
  protected readonly changePasswordTitle = translateSignal(
    'auth.account.changePassword.title',
  );

  protected readonly submitError = signal<string | null>(null);
  protected readonly submitSuccess = signal(false);

  protected readonly isSubmitting = computed(() => this.authStore.isLoading());

  protected readonly model = signal({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  protected readonly passwordForm = form(
    this.model,
    (path) => validateStandardSchema(path, changePasswordSchema),
    {
      submission: {
        action: async (data) => {
          this.submitError.set(null);
          this.submitSuccess.set(false);

          try {
            await this.authStore.changePassword(data().value());
            this.submitSuccess.set(true);
            this.model.set({
              currentPassword: '',
              newPassword: '',
              confirmNewPassword: '',
            });
          } catch (error) {
            this.submitError.set(
              isBackendError(error) ? error.errorCode : 'unknown',
            );
          }
        },
      },
    },
  );
}
