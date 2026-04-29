import { Component, input } from '@angular/core';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';

@Component({
  selector: 'app-job-card',
  standalone: true,
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss',
})
export class JobCardComponent {
  readonly job = input.required<JobDto>();
}
