import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
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
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { EditJobDialogFooterComponent } from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule } from '@jsverse/transloco';
import {
  form,
  FormRoot,
  FormField,
  validateStandardSchema,
} from '@angular/forms/signals';
import { HlmAlert } from '@spartan-ng/helm/alert';
import { provideIcons } from '@ng-icons/core';
import { lucideAlertCircle } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { ZodNgControlBridgeDirective } from '@job-tracker-lite-angular/frontend-data-access';

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
    TranslocoModule,
    HlmAlert,
    HlmIconImports,
    ZodNgControlBridgeDirective,
  ],
  providers: [provideIcons({ lucideAlertCircle })],
  templateUrl: './edit-job.component.html',
})
export class EditJobComponent {
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext = injectBrnDialogContext<EditJobDialogContext>(
    { optional: true },
  );
  protected readonly job = this.dialogContext?.job as JobDto;

  protected readonly updateJobStatus = this.jobsDataAccess.updateJobResource;
  protected readonly jobModel = signal({
    position: this.job?.position ?? '',
    company: this.job?.company ?? '',
    link: this.job?.link ?? '',
    description: this.job?.description ?? '',
    status: this.job?.status ?? JobStatus.SAVED,
  });

  protected readonly backendResponse = computed(() => {
    if (this.updateJobStatus.status() === 'error') {
      return (
        (this.updateJobStatus.error() as any)?.error ??
        this.updateJobStatus.error()
      );
    }
    return null;
  });

  protected readonly jobForm = form(
    this.jobModel,
    (path) => validateStandardSchema(path, updateJobSchema),
    {
      submission: {
        action: async (data) => {
          this.jobsDataAccess.updateJob(this.job.id, data().value());
        },
      },
    },
  );
  constructor() {
    // Effect to close the dialog and reset the form when a job is successfully updated
    effect(() => {
      if (this.updateJobStatus.status() === 'resolved') {
        const updatedJob = this.updateJobStatus.value();
        if (updatedJob) {
          this.dialogRef?.close(updatedJob);

          this.jobsDataAccess.jobsResource.reload();
          this.jobsDataAccess.jobResource.reload();

          untracked(() => {
            this.jobsDataAccess.resetUpdateJob();
          });
        }
      }
    });
    // Effect to reset the update job trigger if there's an error during update
    effect(() => {
      this.jobForm().value();

      untracked(() => {
        const curentStatus = this.jobsDataAccess.updateJobResource.status();
        if (curentStatus === 'error') {
          this.jobsDataAccess.resetUpdateJob();
        }
      });
    });
  }
}
