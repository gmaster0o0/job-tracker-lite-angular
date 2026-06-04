import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import {
  AuthDataAccessService,
  AuthSessionService,
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import { ServerErrorAlertComponent } from '@job-tracker-lite-angular/frontend-shared';
import { loginSchema } from '@job-tracker-lite-angular/schemas';

@Component({
  standalone: true,
  selector: 'app-login',
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
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authDataAccess = inject(AuthDataAccessService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  protected readonly title = translateSignal('auth.login.title');
  protected readonly subtitle = translateSignal('auth.login.subtitle');
  protected readonly subtitleAfterPasswordChange = translateSignal(
    'auth.login.subtitleAfterPasswordChange',
  );

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly wasPasswordChanged = signal(
    this.router.currentNavigation()?.extras.state?.['passwordChanged'] ?? false,
  );

  protected readonly loginModel = signal({
    email: '',
    password: '',
  });

  protected readonly loginForm = form(
    this.loginModel,
    (path) => validateStandardSchema(path, loginSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);

          try {
            const session = await this.authDataAccess.signIn(data().value());
            this.authSession.setSession(session);
            await this.router.navigateByUrl('/jobs');
          } catch (error) {
            if (this.shouldRedirectToVerifyEmail(error)) {
              await this.router.navigateByUrl(
                `/auth/verify-email-notice?email=${encodeURIComponent(
                  data().value().email,
                )}`,
              );
              return;
            }

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

  private shouldRedirectToVerifyEmail(error: unknown): boolean {
    if (!isBackendError(error)) {
      return false;
    }

    return error.errorCode.toUpperCase() === 'EMAIL_NOT_VERIFIED';
  }
}
