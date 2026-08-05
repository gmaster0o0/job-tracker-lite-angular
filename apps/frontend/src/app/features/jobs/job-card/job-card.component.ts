import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { JobDto } from '@job-tracker-lite-angular/schemas';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { AppDatePipe } from '@job-tracker-lite-angular/frontend-data-access';
import { TranslocoModule } from '@jsverse/transloco';
import {
  JOB_STATUS_BADGE_CLASSES,
  JOB_STATUS_LABEL_KEYS,
} from '../job-status-badge-classes';

@Component({
  standalone: true,
  selector: 'app-job-card',
  imports: [
    CommonModule,
    HlmBadgeImports,
    HlmCardImports,
    AppDatePipe,
    TranslocoModule,
  ],
  templateUrl: './job-card.component.html',
})
export class JobCardComponent {
  readonly job = input.required<JobDto>();
  readonly selected = input<boolean>(false);
  readonly variant = input<'compact' | 'default'>('compact');

  protected readonly statusBadgeClasses = JOB_STATUS_BADGE_CLASSES;
  protected readonly statusLabelKeys = JOB_STATUS_LABEL_KEYS;
}
