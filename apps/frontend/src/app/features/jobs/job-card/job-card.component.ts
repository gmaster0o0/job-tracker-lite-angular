import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  HlmCard,
  HlmCardDescription,
  HlmCardFooter,
  HlmCardHeader,
  HlmCardTitle,
} from '@spartan-ng/helm/card';

@Component({
  standalone: true,
  selector: 'app-job-card',
  imports: [
    CommonModule,
    HlmCard,
    HlmCardDescription,
    HlmCardFooter,
    HlmCardHeader,
    HlmCardTitle,
  ],
  templateUrl: './job-card.component.html',
})
export class JobCardComponent {
  readonly job = input.required<JobDto>();

  protected readonly statusClasses: Record<JobDto['status'], string> = {
    saved:
      'rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-700/10',
    applied:
      'rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-700/10',
    interview:
      'rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-700/10',
    'job offered':
      'rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-700/20',
  };
}
