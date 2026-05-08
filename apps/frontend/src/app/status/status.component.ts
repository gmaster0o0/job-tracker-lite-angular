import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    HlmCardImports,
    HlmSpinnerImports,
    HlmBadgeImports,
  ],
  selector: 'app-status',
  templateUrl: './status.component.html',
})
export class StatusComponent {
  protected readonly health = inject(DataAccessService).healthResource;
}
