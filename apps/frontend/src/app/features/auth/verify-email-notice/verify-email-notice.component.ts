import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  validateStandardSchema,
} from '@angular/forms/signals';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  TranslocoModule,
  translateSignal,
  TranslocoService,
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
import {
  sendVerificationEmailSchema,
  type SendVerificationEmailDto,
} from '@job-tracker-lite-angular/schemas';

@Component({
  standalone: true,
  selector: 'app-verify-email-notice',
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
  templateUrl: './verify-email-notice.component.html',
})
export class VerifyEmailNoticeComponent {
  private readonly authDataAccess = inject(AuthDataAccessService);
  private readonly route = inject(ActivatedRoute);
  private readonly translocoService = inject(TranslocoService);

  protected readonly title = translateSignal('auth.verifyEmailNotice.title');
  protected readonly subtitle = translateSignal(
    'auth.verifyEmailNotice.subtitle',
  );

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly isSuccess = signal(false);

  protected readonly verifyEmailNoticeModel = signal<SendVerificationEmailDto>({
    email: this.route.snapshot.queryParamMap.get('email') ?? '',
    language:
      this.translocoService.getActiveLang() === 'hu'
        ? ('hu' as const)
        : ('en' as const),
  });

  protected readonly verifyEmailNoticeForm = form(
    this.verifyEmailNoticeModel,
    (path) => validateStandardSchema(path, sendVerificationEmailSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);
          this.isSuccess.set(false);

          try {
            await this.authDataAccess.sendVerificationEmail(data().value());
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
