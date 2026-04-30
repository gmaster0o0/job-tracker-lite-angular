import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { JobDto, JobStatusDto } from '@job-tracker-lite-angular/api-interfaces';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { ProgessionStepperComponent } from '../../../shared/progession-stepper/progession-stepper.component';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCircleX,
  lucideEllipsisVertical,
  lucidePlus,
} from '@ng-icons/lucide';

type JobTab = 'overview' | 'contacts' | 'notes' | 'cover-letter';

@Component({
  standalone: true,
  selector: 'app-job-detail',
  imports: [
    CommonModule,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmIconImports,
    ProgessionStepperComponent,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideCircleX,
      lucideEllipsisVertical,
    }),
  ],
  templateUrl: './job-detail.component.html',
})
export class JobDetailComponent {
  protected readonly route = inject(ActivatedRoute);
  private readonly dataAccess = inject(DataAccessService);

  protected readonly jobsResource = this.dataAccess.jobsResource;
  protected readonly jobResource = this.dataAccess.jobResource;

  protected readonly activeTab = signal<JobTab>('overview');
  protected readonly isUpdatingStatus = signal(false);

  protected readonly selectedJobId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        if (!id) {
          return null;
        }

        const parsed = Number(id);
        return Number.isNaN(parsed) ? null : parsed;
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

  protected readonly isNotFound = computed(() => {
    if (this.fallbackJob()) {
      return false;
    }

    const error = this.jobResource.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  protected readonly tabs: { label: string; value: JobTab }[] = [
    { label: 'Overview', value: 'overview' },
    { label: 'Contacts', value: 'contacts' },
    { label: 'Notes', value: 'notes' },
    { label: 'Cover Letter', value: 'cover-letter' },
  ];

  protected readonly progressionStatuses: readonly JobStatusDto[] = [
    'saved',
    'applied',
    'interview',
    'job offered',
  ];

  protected readonly progressionLabels: readonly string[] = [
    'Save',
    'Applied',
    'Interview',
    'Offer',
  ];

  protected readonly statusBadgeClasses: Record<JobStatusDto, string> = {
    saved: 'bg-sky-100 text-sky-700 border-sky-200',
    applied: 'bg-amber-100 text-amber-700 border-amber-200',
    interview: 'bg-violet-100 text-violet-700 border-violet-200',
    'job offered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };

  constructor() {
    effect(() => {
      this.dataAccess.selectJob(this.selectedJobId());
    });
  }

  protected setTab(tab: JobTab): void {
    this.activeTab.set(tab);
  }

  protected isRejected(job: JobDto): boolean {
    return job.status === 'rejected';
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
      await this.dataAccess.updateJobStatus(job.id, status);
    } finally {
      this.isUpdatingStatus.set(false);
    }
  }

  protected async reject(job: JobDto): Promise<void> {
    if (this.isUpdatingStatus() || job.status === 'rejected') {
      return;
    }

    this.isUpdatingStatus.set(true);
    try {
      await this.dataAccess.updateJobStatus(job.id, 'rejected');
    } finally {
      this.isUpdatingStatus.set(false);
    }
  }

  protected formatStatus(status: JobStatusDto): string {
    return status.toUpperCase();
  }
}
