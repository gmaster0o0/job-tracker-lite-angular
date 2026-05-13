import { Component, inject, type Signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideInfo,
  lucideSettings,
  lucideUser,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { TranslocoService, translateSignal } from '@jsverse/transloco';

type MainMenuItem = {
  readonly label: Signal<string>;
  readonly icon: string;
  readonly path: string;
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
    }),
  ],
  templateUrl: './main-menu.component.html',
})
export class MainMenuComponent {
  private readonly transloco = inject(TranslocoService);
  protected readonly items: readonly MainMenuItem[] = [
    {
      label: translateSignal('common.jobs'),
      icon: 'lucideBriefcase',
      path: '/jobs',
    },
    {
      label: translateSignal('common.profile'),
      icon: 'lucideUser',
      path: '/profile',
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
  ];
}
