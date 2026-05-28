import { Component, computed, inject, type Signal } from '@angular/core';
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
import { AuthStore } from '../../features/auth/auth.store';

type MainMenuItem = {
  readonly label: Signal<string>;
  readonly icon: string;
  readonly path: string;
  readonly visibility: 'guest' | 'user' | 'all';
};

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
  private readonly authStore = inject(AuthStore);

  protected readonly items: readonly MainMenuItem[] = [
    {
      label: translateSignal('common.jobs'),
      icon: 'lucideBriefcase',
      path: '/jobs',
      visibility: 'user',
    },
    {
      label: translateSignal('common.profile'),
      icon: 'lucideUser',
      path: '/profile',
      visibility: 'user',
    },
    {
      label: translateSignal('common.settings'),
      icon: 'lucideSettings',
      path: '/settings',
      visibility: 'user',
    },
    {
      label: translateSignal('common.about'),
      icon: 'lucideInfo',
      path: '/about',
      visibility: 'all',
    },
    {
      label: translateSignal('common.login'),
      icon: 'lucideLogIn',
      path: '/auth/login',
      visibility: 'guest',
    },
    {
      label: translateSignal('common.register'),
      icon: 'lucideUserPlus',
      path: '/auth/register',
      visibility: 'guest',
    },
  ];

  protected readonly visibleItems = computed(() => {
    const isAuthenticated = this.authStore.isAuthenticated();

    return this.items.filter((item) => {
      if (item.visibility === 'all') {
        return true;
      }

      if (item.visibility === 'guest') {
        return !isAuthenticated;
      }

      return isAuthenticated;
    });
  });
}
