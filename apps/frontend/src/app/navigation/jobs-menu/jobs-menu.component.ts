import { Component, computed, inject, signal, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { JobStatusDto } from '@job-tracker-lite-angular/api-interfaces';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { JobCardComponent } from '../../features/jobs/job-card/job-card.component';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideGhost } from '@ng-icons/lucide';

type FilterValue = JobStatusDto | null;

type FilterChip = {
  readonly label: string;
  readonly value: FilterValue;
};

@Component({
  standalone: true,
  selector: 'app-jobs-menu',
  imports: [
    RouterLink,
    RouterLinkActive,
    JobCardComponent,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
  ],
  providers: [provideIcons({ lucideSearch, lucideGhost })],
  templateUrl: './jobs-menu.component.html',
})
export class JobsMenuComponent {
  private readonly router = inject(Router);
  private readonly _dataAccess = inject(DataAccessService);
  protected readonly jobsResource = this._dataAccess.jobsResource;

  protected readonly searchQuery = signal('');
  protected readonly activeFilter = signal<FilterValue>(null);
  protected readonly showRejected = signal(false);

  constructor() {
    effect(() => {
      const data = this.jobsResource.value();
      if (data && data.length > 0 && this.router.url === '/jobs') {
        this.router.navigate(['/jobs', data[0].id], { replaceUrl: true });
      }
    });
  }

  protected readonly chips: readonly FilterChip[] = [
    { label: 'All', value: null },
    { label: 'Save', value: 'saved' },
    { label: 'Applied', value: 'applied' },
    { label: 'Interview', value: 'interview' },
    { label: 'Offer', value: 'job offered' },
  ];

  protected readonly filteredJobs = computed(() => {
    const data = this.jobsResource.value() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.activeFilter();
    const showRejected = this.showRejected();

    return data.filter((job) => {
      if (!showRejected && job.status === 'rejected') {
        return false;
      }

      const matchesSearch =
        !query ||
        job.position.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query);
      const matchesFilter = filter === null || job.status === filter;

      return matchesSearch && matchesFilter;
    });
  });

  protected setFilter(value: FilterValue): void {
    this.activeFilter.set(value);
  }

  protected toggleRejected(): void {
    this.showRejected.update((v) => !v);
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
