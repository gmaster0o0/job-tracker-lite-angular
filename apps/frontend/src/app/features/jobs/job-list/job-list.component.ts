import { Component, input } from '@angular/core';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import { JobCardComponent } from '../job-card/job-card.component';

@Component({
  standalone: true,
  selector: 'app-job-list',
  imports: [JobCardComponent],
  templateUrl: './job-list.component.html',
})
export class JobListComponent {
  readonly jobs = input.required<JobDto[]>();
}
