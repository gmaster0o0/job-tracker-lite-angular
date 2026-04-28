import { CommonModule, DatePipe, LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

@Component({
  imports: [CommonModule, DatePipe, LowerCasePipe],
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
})
export class StatusComponent {
  protected readonly health = inject(DataAccessService).healthResource;
}
