import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { UptimePipe } from './uptime.pipe';
import {
  HealthDataAccessService,
  isHealthUnreachable,
  selectHealthValue,
} from '@job-tracker-lite-angular/frontend-data-access';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
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

  protected readonly health = computed(() =>
    selectHealthValue(this.healthResource),
  );

  protected readonly isUnreachable = computed(() =>
    isHealthUnreachable(this.healthResource, this.health()),
  );
}
