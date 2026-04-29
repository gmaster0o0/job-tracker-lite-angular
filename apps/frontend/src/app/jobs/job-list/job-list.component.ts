import { Component, input } from '@angular/core';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import { JobCardComponent } from '../job-card/job-card.component';
import { HlmCardImports } from '@shared-ui/helm/card';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [JobCardComponent, HlmCardImports],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
})
export class JobListComponent {
  readonly jobs = input.required<JobDto[]>();
}
