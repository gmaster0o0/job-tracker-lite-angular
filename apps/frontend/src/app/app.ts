import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

@Component({
  imports: [CommonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Health Check';
  protected readonly health = inject(DataAccessService).healthResource;
}
