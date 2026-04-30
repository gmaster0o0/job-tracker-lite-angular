import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

@Component({
  standalone: true,
  selector: 'app-job-detail',
  template: `
    <div class="flex h-full items-center justify-center text-muted-foreground">
      @if (jobsResource.isLoading()) {
        <p class="text-sm">Loading...</p>
      } @else if (jobsResource.value()?.length === 0) {
        <p class="text-sm">No jobs in the list. Please add a new job.</p>
      } @else if (!route.snapshot.paramMap.get('id')) {
        <p class="text-sm">Select a job from the list to view details.</p>
      } @else {
        <p class="text-sm">Job details coming soon.</p>
      }
    </div>
  `,
})
export class JobDetailComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly jobsResource = inject(DataAccessService).jobsResource;
}
