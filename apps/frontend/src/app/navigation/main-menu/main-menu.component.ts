import { Component, inject, type Signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideInfo,
  lucideLogIn,
  lucideSettings,
  lucideUserPlus,
  lucideUser,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { translateSignal } from '@jsverse/transloco';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import { MenuItem, NavigationService } from '../navigation.service';

interface MainMenuItem extends MenuItem {
  readonly label: Signal<string>;
  readonly icon: string;
  readonly path: string;
  readonly requiresAuth?: boolean;
  readonly questOnly?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-main-menu',
  imports: [RouterLink, RouterLinkActive, HlmSidebarImports, HlmIconImports],
  providers: [
    provideIcons({
      lucideBriefcase,
      lucideUser,
      lucideSettings,
      lucideInfo,
      lucideLogIn,
      lucideUserPlus,
    }),
  ],
  templateUrl: './main-menu.component.html',
})
export class MainMenuComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly navigationService = inject(NavigationService);

  protected readonly isAuthenticated = this.authSession.isAuthenticated;
  protected readonly isItemVisible = this.navigationService.isItemVisible;

  protected readonly items: readonly MainMenuItem[] = [
    {
      label: translateSignal('common.jobs'),
      icon: 'lucideBriefcase',
      path: '/jobs',
      requiresAuth: true,
    },
    {
      label: translateSignal('common.profile'),
      icon: 'lucideUser',
      path: '/profile',
      requiresAuth: true,
    },
    {
      label: translateSignal('common.settings'),
      icon: 'lucideSettings',
      path: '/settings',
    },
    {
      label: translateSignal('common.about'),
      icon: 'lucideInfo',
      path: '/about',
    },
    {
      label: translateSignal('common.login'),
      icon: 'lucideLogIn',
      path: '/auth/login',
      questOnly: true,
    },
    {
      label: translateSignal('common.register'),
      icon: 'lucideUserPlus',
      path: '/auth/register',
      questOnly: true,
    },
  ];
}
