import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { UptimePipe } from './uptime.pipe';
import { HealthDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HttpErrorResponse } from '@angular/common/http';
import { HealthResponseDto } from '@job-tracker-lite-angular/schemas';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    HlmCardImports,
    HlmSpinnerImports,
    HlmBadgeImports,
    UptimePipe,
    HlmButtonImports,
    HlmIconImports,
    RouterLink,
    TranslocoModule,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
    }),
  ],
  selector: 'app-status',
  templateUrl: './status.component.html',
})
export class StatusComponent {
  private readonly dataAccess = inject(HealthDataAccessService);
  protected readonly healthResource = this.dataAccess.healthResource;

  protected readonly health = computed(() => {
    if (this.healthResource.hasValue()) {
      return this.healthResource.value() ?? null;
    }

    const err = this.healthResource.error();
    if (err instanceof HttpErrorResponse && err.status === 503 && err.error) {
      return err.error as HealthResponseDto;
    }

    return null;
  });

  // The backend isn't reporting a degraded status - it's not responding at
  // all (connection refused, proxy timeout, etc.). Shown as a distinct
  // fallback instead of the generic "failed to load" message.
  protected readonly isUnreachable = computed(() => {
    if (this.health() !== null || this.healthResource.isLoading()) {
      return false;
    }

    const err = this.healthResource.error();
    return err instanceof HttpErrorResponse && err.status === 0;
  });
}
