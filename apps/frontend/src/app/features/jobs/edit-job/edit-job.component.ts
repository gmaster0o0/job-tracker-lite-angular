import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import {
  JobDto,
  JobStatus,
  updateJobSchema,
} from '@job-tracker-lite-angular/schemas';
import {
  JobsDataAccessService,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import {
  EditJobDialogFooterComponent,
  ServerErrorAlertComponent,
} from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import {
  form,
  FormRoot,
  FormField,
  validateStandardSchema,
} from '@angular/forms/signals';
import {
  ZodNgControlBridgeDirective,
  NotificationService,
} from '@job-tracker-lite-angular/frontend-data-access';

type EditJobDialogContext = {
  job: JobDto;
};

@Component({
  standalone: true,
  selector: 'app-edit-job',
  imports: [
    CommonModule,
    FormRoot,
    FormField,
    HlmInputImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmTextarea,
    HlmDialogImports,
    EditJobDialogFooterComponent,
    ServerErrorAlertComponent,
    TranslocoModule,
    FormRoot,
    FormField,
    ZodNgControlBridgeDirective,
  ],
  templateUrl: './edit-job.component.html',
})
export class EditJobComponent {
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext = injectBrnDialogContext<EditJobDialogContext>(
    { optional: true },
  );
  protected readonly job = this.dialogContext?.job as JobDto;

  private readonly successMessage = translateSignal('jobs.update.success', {
    defaultValue: 'Job updated successfully',
  });

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly jobModel = signal({
    position: this.job?.position ?? '',
    company: this.job?.company ?? '',
    link: this.job?.link ?? '',
    description: this.job?.description ?? '',
    status: this.job?.status ?? JobStatus.SAVED,
  });

  protected readonly jobForm = form(
    this.jobModel,
    (path) => validateStandardSchema(path, updateJobSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);
          try {
            const job = await this.jobsDataAccess.updateJob(
              this.job.id,
              data().value(),
            );
            this.notification.success(this.successMessage());
            this.dialogRef?.close(job);
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
