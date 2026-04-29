import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import { HelmCardComponent } from 'spartan/ui/helm';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, HelmCardComponent],
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss',
})
export class JobCardComponent {
  readonly job = input.required<JobDto>();

  protected readonly statusClasses: Record<JobDto['status'], string> = {
    saved:
      'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-800 bg-sky-100',
    applied:
      'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 bg-amber-100',
    interview:
      'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-800 bg-violet-100',
    'job offered':
      'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 bg-emerald-100',
  };
}
