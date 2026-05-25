import { provideIcons } from '@ng-icons/core';
import { lucideAlertCircle } from '@ng-icons/lucide';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import {
  createJobSchema,
  JobDto,
  JobStatus,
} from '@job-tracker-lite-angular/schemas';
import {
  JobsDataAccessService,
  ZodNgControlBridgeDirective,
} from '@job-tracker-lite-angular/frontend-data-access';
import { CreateJobDialogFooterComponent } from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule } from '@jsverse/transloco';
import {
  form,
  validateStandardSchema,
  FormRoot,
  FormField,
} from '@angular/forms/signals';
import { HlmIconImports } from '@spartan-ng/helm/icon';
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
    HlmIconImports,
    HlmAlertImports,
  ],
  providers: [provideIcons({ lucideAlertCircle })],
  templateUrl: './create-job.component.html',
})
export class CreateJobComponent {
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext =
    injectBrnDialogContext<CreateJobDialogContext>({ optional: true });

  protected readonly createJobStatus = this.jobsDataAccess.createJobResource;

  protected readonly jobModel = signal({
    position: '',
    company: '',
    link: '',
    description: '',
    status: JobStatus.SAVED,
  });

  protected readonly backendResponse = computed(() => {
    if (this.createJobStatus.status() === 'error') {
      return (
        (this.createJobStatus.error() as any)?.error ??
        this.createJobStatus.error()
      );
    }
    return null;
  });

  protected readonly jobForm = form(
    this.jobModel,
    (path) => validateStandardSchema(path, createJobSchema),
    {
      submission: {
        action: async (data) => {
          this.jobsDataAccess.createJob(data().value());
        },
      },
    },
  );

  constructor() {
    // Effect to close the dialog and reset the form when a job is successfully created
    effect(() => {
      if (this.createJobStatus.status() === 'resolved') {
        const createdJob = this.createJobStatus.value();
        if (createdJob) {
          this.dialogContext?.onCreated?.(createdJob);
          this.dialogRef?.close(createdJob);

          this.jobsDataAccess.jobsResource.reload();
        }
      }
    });

    effect(() => {
      this.jobForm().value();

      untracked(() => {
        const curentStatus = this.jobsDataAccess.createJobResource.status();
        if (curentStatus === 'error') {
          this.jobsDataAccess.resetCreateJob();
        }
      });
    });
  }
}
