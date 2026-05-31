import { Component, inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideArrowLeft } from '@ng-icons/lucide';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { version as appVersion } from '../../../environments/version';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import { NavigationService } from '../navigation.service';
@Component({
  standalone: true,
  selector: 'app-sidenav',
  providers: [
    provideIcons({
      lucideLogOut,
      lucideArrowLeft,
    }),
  ],
  imports: [
    HlmSidebarImports,
    HlmIconImports,
    HlmButtonImports,
    HlmTooltipImports,
    RouterLink,
    TranslocoModule,
  ],
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly navigationService = inject(NavigationService);

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
  protected readonly statusTooltip = translateSignal(
    'navigation.statusTooltip',
  );
  protected readonly appTitleTooltip = translateSignal(
    'navigation.appTitleTooltip',
  );

  protected handleBack(): void {
    this.navigationService.handleBack();
  }

  protected handleLogout(): Promise<void> {
    return this.navigationService.handleLogout();
  }
}
