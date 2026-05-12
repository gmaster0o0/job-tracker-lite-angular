import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { lucideShield, lucideSettings, lucideKey } from '@ng-icons/lucide';

type SettingsMenuItem = {
  readonly label: string;
  readonly icon: string;
  readonly path: string;
};

@Component({
  standalone: true,
  selector: 'app-settings-menu',
  imports: [RouterLink, RouterLinkActive, HlmSidebarImports, HlmIconImports],
  providers: [provideIcons({ lucideShield, lucideSettings, lucideKey })],
  templateUrl: './settings-menu.component.html',
})
export class SettingsMenuComponent {
  protected readonly items: readonly SettingsMenuItem[] = [
    {
      label: 'Preferences',
      icon: 'lucideSettings',
      path: '/settings/preferences',
    },
    { label: 'Account', icon: 'lucideKey', path: '/settings/account' },
    { label: 'Privacy', icon: 'lucideShield', path: '/settings/privacy' },
  ];
}
