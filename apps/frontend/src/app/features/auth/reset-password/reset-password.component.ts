import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  validateStandardSchema,
} from '@angular/forms/signals';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import {
  AuthDataAccessService,
  NotificationService,
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import { ServerErrorAlertComponent } from '@job-tracker-lite-angular/frontend-shared';
import { resetPasswordSchema } from '@job-tracker-lite-angular/schemas';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
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
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly authDataAccess = inject(AuthDataAccessService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  private readonly resetPasswordSuccessMessage = translateSignal(
    'auth.resetPassword.success',
  );

  protected readonly title = translateSignal('auth.resetPassword.title');
  protected readonly subtitle = translateSignal('auth.resetPassword.subtitle');

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly resetPasswordModel = signal({
    token: this.route.snapshot.queryParamMap.get('token') ?? '',
    newPassword: '',
    confirmPassword: '',
  });

  protected readonly resetPasswordForm = form(
    this.resetPasswordModel,
    (path) => validateStandardSchema(path, resetPasswordSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);
          this.isSuccess.set(false);

          try {
            await this.authDataAccess.resetPassword(data().value());
            this.isSuccess.set(true);
            this.notification.success(this.resetPasswordSuccessMessage());
            await this.router.navigateByUrl('/auth/login');
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
