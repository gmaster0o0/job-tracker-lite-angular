import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideInfo,
  lucideSettings,
  lucideUser,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@shared-ui/helm/sidebar';
import { HlmIconImports } from '@shared-ui/helm/icon';

type MainMenuItem = {
  readonly label: string;
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
  protected readonly items: readonly MainMenuItem[] = [
    { label: 'Jobs', icon: 'lucideBriefcase', path: '/jobs' },
    { label: 'Profile', icon: 'lucideUser', path: '/profile' },
    { label: 'Settings', icon: 'lucideSettings', path: '/settings' },
    { label: 'About', icon: 'lucideInfo', path: '/about' },
  ];
}
