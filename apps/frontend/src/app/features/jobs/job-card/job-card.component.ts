import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { JobDto, JobStatusDto } from '@job-tracker-lite-angular/api-interfaces';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  standalone: true,
  selector: 'app-job-card',
  imports: [CommonModule, HlmBadgeImports, HlmCardImports],
  templateUrl: './job-card.component.html',
})
export class JobCardComponent {
  readonly job = input.required<JobDto>();
  readonly selected = input<boolean>(false);
  readonly variant = input<'compact' | 'default'>('compact');

  protected readonly statusBadgeClasses: Record<JobStatusDto, string> = {
    saved: 'bg-sky-100 text-sky-700 border-sky-200',
    applied: 'bg-amber-100 text-amber-700 border-amber-200',
    interview: 'bg-violet-100 text-violet-700 border-violet-200',
    'job offered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };
}
