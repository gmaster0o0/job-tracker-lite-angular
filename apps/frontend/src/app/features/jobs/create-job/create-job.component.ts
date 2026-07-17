import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import {
  createJobSchema,
  JobDto,
  JobStatus,
} from '@job-tracker-lite-angular/schemas';
import {
  JobsDataAccessService,
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  CreateJobDialogFooterComponent,
  ServerErrorAlertComponent,
} from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import {
  form,
  validateStandardSchema,
  FormRoot,
  FormField,
} from '@angular/forms/signals';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';

type CreateJobDialogContext = {
  onCreated?: (job: JobDto) => void;
};

@Component({
  standalone: true,
  selector: 'app-create-job',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmTextarea,
    HlmDialogImports,
    CreateJobDialogFooterComponent,
    TranslocoModule,
    FormRoot,
    FormField,
    ZodNgControlBridgeDirective,
    ServerErrorAlertComponent,
  ],
  templateUrl: './create-job.component.html',
})
export class CreateJobComponent {
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext =
    injectBrnDialogContext<CreateJobDialogContext>({ optional: true });

  private readonly successMessage = translateSignal('jobs.create.success', {
    defaultValue: 'Job created successfully',
  });

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly jobModel = signal({
    position: '',
    company: '',
    link: '',
    description: '',
    status: JobStatus.SAVED,
  });

  protected readonly jobForm = form(
    this.jobModel,
    (path) => validateStandardSchema(path, createJobSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);
          try {
            const job = await this.jobsDataAccess.createJob(data().value());
            this.notification.success(this.successMessage());
            this.dialogContext?.onCreated?.(job);
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
