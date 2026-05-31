import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  validateStandardSchema,
} from '@angular/forms/signals';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TranslocoModule,
  TranslocoService,
  translateSignal,
} from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import {
  AuthDataAccessService,
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import { ServerErrorAlertComponent } from '../../../shared/server-error-alert/server-error-alert.component';
import { forgotPasswordSchema } from '@job-tracker-lite-angular/schemas';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    TranslocoModule,
    FormRoot,
    FormField,
    ZodNgControlBridgeDirective,
    ServerErrorAlertComponent,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly authDataAccess = inject(AuthDataAccessService);
  private readonly translocoService = inject(TranslocoService);

  protected readonly title = translateSignal('auth.forgotPassword.title');
  protected readonly subtitle = translateSignal('auth.forgotPassword.subtitle');

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly forgotPasswordModel = signal({
    email: '',
    language:
      this.translocoService.getActiveLang() === 'hu'
        ? ('hu' as const)
        : ('en' as const),
  });

  protected readonly forgotPasswordForm = form(
    this.forgotPasswordModel,
    (path) => validateStandardSchema(path, forgotPasswordSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);
          this.isSuccess.set(false);

          try {
            await this.authDataAccess.requestPasswordReset(data().value());
            this.isSuccess.set(true);
          } catch (error) {
            this.submitError.set(
              isBackendError(error) ? error.errorCode : 'unknown',
            );
          } finally {
            this.isSubmitting.set(false);
          }
        },
      },
    },
  );
}
