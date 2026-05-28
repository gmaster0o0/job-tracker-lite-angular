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
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import { ServerErrorAlertComponent } from '@job-tracker-lite-angular/frontend-shared';
import { registerSchema } from '@job-tracker-lite-angular/schemas';
import { AuthStore } from '../auth.store';

@Component({
  standalone: true,
  selector: 'app-register',
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
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly title = translateSignal('auth.register.title');
  protected readonly subtitle = translateSignal('auth.register.subtitle');

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly registerModel = signal({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  protected readonly registerForm = form(
    this.registerModel,
    (path) => validateStandardSchema(path, registerSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);

          try {
            await this.authStore.signUp(data().value());
            await this.router.navigateByUrl('/jobs');
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
