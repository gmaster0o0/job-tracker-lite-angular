import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, merge, of } from 'rxjs';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { JobListComponent } from './jobs/job-list/job-list.component';

@Component({
  standalone: true,
  imports: [RouterOutlet, JobListComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  protected readonly jobs = inject(DataAccessService).jobsResource;
  private readonly currentUrl = toSignal(
    merge(
      of(this.router.url),
      this.router.events.pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        map((event) => event.urlAfterRedirects),
      ),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isStatusRoute = computed(
    () => this.currentUrl() === '/status',
  );
}
