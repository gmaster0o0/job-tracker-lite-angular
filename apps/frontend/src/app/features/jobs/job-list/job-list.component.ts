import { Component, inject } from '@angular/core';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { JobCardComponent } from '../job-card/job-card.component';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';

@Component({
  standalone: true,
  selector: 'app-job-list',
  providers: [provideIcons({ lucideSearch })],
  imports: [JobCardComponent, HlmIconImports, HlmInputImports],
  templateUrl: './job-list.component.html',
})
export class JobListComponent {
  protected readonly jobs = inject(DataAccessService).jobsResource;
}
