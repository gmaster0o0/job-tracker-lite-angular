import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  type Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { JobDto, JobStatusDto } from '@job-tracker-lite-angular/schemas';
import {
  JobsDataAccessService,
  ContactsDataAccessService,
  NotesDataAccessService,
  isHttpError,
} from '@job-tracker-lite-angular/frontend-data-access';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { CreateJobComponent } from '../create-job/create-job.component';
import { EditJobComponent } from '../edit-job/edit-job.component';
import { ContactsTabComponent } from '../contacts/contacts-tab/contacts-tab.component';
import { JobOverviewComponent } from '../job-overview/job-overview.component';
import { ProgessionStepperComponent } from '@job-tracker-lite-angular/frontend-shared';
import { DeleteConfirmationDialogComponent } from '@job-tracker-lite-angular/frontend-shared';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCircleX,
  lucideEllipsisVertical,
  lucidePlus,
  lucideTrash,
  lucidePencil,
} from '@ng-icons/lucide';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { NotesTabComponent } from '../notes/notes-tab/notes-tab.component';
import { translateSignal, TranslocoModule } from '@jsverse/transloco';
import { JobStatus } from '@job-tracker-lite-angular/schemas';

type JobTab = 'overview' | 'contacts' | 'notes' | 'cover-letter';

@Component({
  standalone: true,
  selector: 'app-job-detail',
  imports: [
    CommonModule,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmTabsImports,
    BrnTabsImports,
    HlmIconImports,
    JobOverviewComponent,
    ProgessionStepperComponent,
    HlmDropdownMenuImports,
    HlmTooltipImports,
    ContactsTabComponent,
    NotesTabComponent,
    TranslocoModule,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideCircleX,
      lucideEllipsisVertical,
      lucideTrash,
      lucidePencil,
    }),
  ],
  templateUrl: './job-detail.component.html',
})
export class JobDetailComponent {
  // Injecting necessary services and modules
  protected readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly contactsDataAccess = inject(ContactsDataAccessService);
  private readonly notesDataAccess = inject(NotesDataAccessService);
  private readonly dialog = inject(HlmDialogService);

  private readonly deleteDescription = translateSignal(
    'jobs.deleteDialog.description',
  );
  private readonly deleteConfirmLabel = translateSignal(
    'jobs.deleteDialog.confirmLabel',
  );
  private readonly deleteTitleKey = 'jobs.deleteDialog.title';
  private readonly deleteTitleParams = computed(() => ({
    company: this.job()?.company ?? '',
  }));
  private readonly deleteTitle = translateSignal(
    this.deleteTitleKey,
    this.deleteTitleParams,
  );

  // Resource signals for jobs, contacts, and notes
  protected readonly jobsResource = this.jobsDataAccess.jobsResource;
  protected readonly jobResource = this.jobsDataAccess.jobResource;

  protected readonly activeTab = signal<JobTab>('overview');
  protected readonly isUpdatingStatus = signal(false);

  protected readonly selectedJobId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        return id;
      }),
    ),
    { initialValue: null },
  );

  protected readonly fallbackJob = computed(() => {
    const id = this.selectedJobId();
    if (id === null) {
      return undefined;
    }

    return this.jobsResource.value()?.find((job) => job.id === id);
  });

  protected readonly job = computed(
    () => this.jobResource.value() ?? this.fallbackJob(),
  );
  /**
   * isNotFound  helper signal to determine if the job resource returned a 404 error,
   * indicating that the job with the specified ID does not exist. This is used to show a specific "Job not found" message in the UI, differentiating it from other types of errors that may occur when fetching the job details.
   */
  protected readonly isNotFound = computed(() => {
    if (this.fallbackJob()) return false;

    const error = this.jobResource.error();
    return isHttpError(error) && error.status === 404;
  });

  protected readonly tabs: readonly { label: () => string; value: JobTab }[] = [
    {
      label: translateSignal('jobs.tabs.overview'),
      value: 'overview',
    },
    {
      label: translateSignal('jobs.tabs.contacts'),
      value: 'contacts',
    },
    { label: translateSignal('jobs.tabs.notes'), value: 'notes' },
    {
      label: translateSignal('jobs.tabs.coverLetter'),
      value: 'cover-letter',
    },
  ];

  protected readonly progressionStatuses: readonly JobStatusDto[] = [
    JobStatus.SAVED,
    JobStatus.APPLIED,
    JobStatus.INTERVIEW,
    JobStatus.JOB_OFFERED,
  ];

  protected readonly progressionLabelSignals: readonly Signal<string>[] = [
    translateSignal('jobs.progression.saved'),
    translateSignal('jobs.progression.applied'),
    translateSignal('jobs.progression.interview'),
    translateSignal('jobs.progression.offer'),
  ];

  protected readonly progressionLabels = computed(() =>
    this.progressionLabelSignals.map((s) => s()),
  );

  protected readonly statusBadgeClasses: Record<JobStatusDto, string> = {
    [JobStatus.SAVED]: 'bg-sky-100 text-sky-700 border-sky-200',
    [JobStatus.APPLIED]: 'bg-amber-100 text-amber-700 border-amber-200',
    [JobStatus.INTERVIEW]: 'bg-violet-100 text-violet-700 border-violet-200',
    [JobStatus.JOB_OFFERED]:
      'bg-emerald-100 text-emerald-700 border-emerald-200',
    [JobStatus.REJECTED]: 'bg-red-100 text-red-700 border-red-200',
  };

  constructor() {
    effect(() => {
      const jobId: string | null = this.selectedJobId();
      this.jobsDataAccess.selectJob(jobId);
      this.contactsDataAccess.selectJob(jobId);
      this.notesDataAccess.selectJob(jobId);
    });
  }

  protected setTab(tab: JobTab): void {
    this.activeTab.set(tab);
  }

  protected openCreateJobDialog(): void {
    this.dialog.open(CreateJobComponent, {
      contentClass: 'sm:max-w-2xl w-[95vw]',
      context: {
        onCreated: (created: JobDto) => {
          this.router.navigate(['/jobs', created.id]);
        },
      },
    });
  }

  protected openEditJobDialog(job: JobDto): void {
    this.dialog.open(EditJobComponent, {
      contentClass: 'sm:max-w-2xl w-[95vw]',
      context: {
        job,
      },
    });
  }

  protected openDeleteJobDialog(job: JobDto): void {
    this.dialog.open(DeleteConfirmationDialogComponent, {
      contentClass: 'sm:max-w-xl !sm:mx-auto',
      context: {
        title: this.deleteTitle(),
        description: this.deleteDescription(),
        confirmLabel: this.deleteConfirmLabel(),
        onConfirm: async () => {
          await this.jobsDataAccess.deleteJob(job.id);
          this.router.navigate(['/jobs']);
        },
      },
    });
  }

  protected onTabSelected(tab: string): void {
    const isKnownTab = this.tabs.some((item) => item.value === tab);
    if (!isKnownTab) {
      return;
    }

    this.setTab(tab as JobTab);
  }

  protected isRejected(job: JobDto): boolean {
    return job.status === JobStatus.REJECTED;
  }

  protected currentProgressIndex(job: JobDto): number {
    if (this.isRejected(job)) {
      return -1;
    }

    const index = this.progressionStatuses.indexOf(job.status);
    return index === -1 ? -1 : index;
  }

  protected async onStepSelected(index: number, job: JobDto): Promise<void> {
    const nextStatus = this.progressionStatuses[index];
    if (!nextStatus) {
      return;
    }

    await this.moveToStatus(nextStatus, job);
  }

  protected async moveToStatus(
    status: JobStatusDto,
    job: JobDto,
  ): Promise<void> {
    if (this.isUpdatingStatus() || job.status === status) {
      return;
    }

    this.isUpdatingStatus.set(true);
    try {
      await this.jobsDataAccess.updateJobStatus(job.id, status);
    } finally {
      this.isUpdatingStatus.set(false);
    }
  }

  protected async reject(job: JobDto): Promise<void> {
    if (this.isUpdatingStatus() || job.status === JobStatus.REJECTED) {
      return;
    }

    this.isUpdatingStatus.set(true);
    try {
      await this.jobsDataAccess.updateJobStatus(job.id, JobStatus.REJECTED);
    } finally {
      this.isUpdatingStatus.set(false);
    }
  }

  protected formatStatus(status: JobStatusDto): string {
    return status.toUpperCase();
  }
}
