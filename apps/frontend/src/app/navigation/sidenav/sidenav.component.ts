import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { provideIcons } from '@ng-icons/core';
import {
  lucideLogOut,
  lucideUndo2,
  lucideCircleCheck,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { version as appVersion } from '../../../environments/version';
import {
  TranslocoModule,
  translateSignal,
  translateObjectSignal,
} from '@jsverse/transloco';
import {
  AuthSessionService,
  HealthDataAccessService,
  selectHealthValue,
} from '@job-tracker-lite-angular/frontend-data-access';
import { NavigationService } from '../navigation.service';
import { AuthService } from '../../features/auth/auth.service';

type HealthState = 'ok' | 'warning';

@Component({
  standalone: true,
  selector: 'app-sidenav',
  providers: [
    provideIcons({
      lucideLogOut,
      lucideUndo2,
      lucideCircleCheck,
      lucideTriangleAlert,
    }),
  ],
  imports: [
    HlmSidebarImports,
    HlmIconImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmBadgeImports,
    RouterLink,
    TranslocoModule,
  ],
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly navigationService = inject(NavigationService);
  private readonly authService = inject(AuthService);
  private readonly healthDataAccess = inject(HealthDataAccessService);

  protected readonly isAuthenticated = this.authSession.isAuthenticated;

  protected readonly isRoot = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url === '/'),
    ),
    {
      initialValue: this.router.url === '/',
    },
  );
  protected readonly version = appVersion;

  protected readonly backTooltip = translateSignal('navigation.backTooltip');
  protected readonly logoutTooltip = translateSignal('common.logout');
  protected readonly appTitleTooltip = translateSignal(
    'navigation.appTitleTooltip',
  );

  // The navbar reflects readiness (can we serve traffic?), not the full
  // detailed report - so a non-critical dependency like redis being down
  // does not surface as a warning here. The /status page shows the details.
  private readonly healthResource = this.healthDataAccess.readinessResource;

  private readonly health = computed(() =>
    selectHealthValue(this.healthResource),
  );

  // While the resource is still loading, show the neutral "ok" look rather
  // than a distinct spinner state - only flip to "warning" once we have
  // confirmation something is actually wrong.
  protected readonly healthState = computed<HealthState>(() => {
    const health = this.health();
    if (health) {
      return health.status === 'ok' ? 'ok' : 'warning';
    }
    return this.healthResource.isLoading() ? 'ok' : 'warning';
  });

  protected readonly statusIcon = computed(() =>
    this.healthState() === 'ok' ? 'lucideCircleCheck' : 'lucideTriangleAlert',
  );

  // Only the icon carries the status color - the badge itself stays neutral.
  protected readonly statusIconClass = computed(() =>
    this.healthState() === 'ok'
      ? 'text-green-600 dark:text-green-400'
      : 'text-amber-600 dark:text-amber-400',
  );

  private readonly statusTooltipCopyRaw = translateObjectSignal(
    'navigation.status.tooltip',
  );

  protected readonly statusTooltipCopy = computed(
    () => this.statusTooltipCopyRaw() as { title: string; description: string },
  );

  protected handleBack(): void {
    this.navigationService.handleBack();
  }

  protected handleLogout(): Promise<void> {
    return this.authService.handleLogout();
  }
}
