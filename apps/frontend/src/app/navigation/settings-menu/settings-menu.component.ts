import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { lucideShield, lucideSettings, lucideKey } from '@ng-icons/lucide';
import { translateSignal } from '@jsverse/transloco';
import { MenuItem, NavigationService } from '../navigation.service';

type SettingsMenuItem = MenuItem & {
  readonly label: () => string;
  readonly icon: string;
  readonly path: string;
  readonly requiresAuth?: boolean;
  readonly questOnly?: boolean;
};

@Component({
  standalone: true,
  selector: 'app-settings-menu',
  imports: [RouterLink, RouterLinkActive, HlmSidebarImports, HlmIconImports],
  providers: [provideIcons({ lucideShield, lucideSettings, lucideKey })],
  templateUrl: './settings-menu.component.html',
})
export class SettingsMenuComponent {
  private readonly navigationService = inject(NavigationService);

  protected readonly isItemVisible = this.navigationService.isItemVisible;

  protected readonly items: readonly SettingsMenuItem[] = [
    {
      label: translateSignal('settings.preferences'),
      icon: 'lucideSettings',
      path: '/settings/preferences',
    },
    {
      label: translateSignal('settings.account'),
      icon: 'lucideKey',
      path: '/settings/account',
      requiresAuth: true,
    },
    {
      label: translateSignal('settings.privacy'),
      icon: 'lucideShield',
      path: '/settings/privacy',
      requiresAuth: true,
    },
  ];
}
