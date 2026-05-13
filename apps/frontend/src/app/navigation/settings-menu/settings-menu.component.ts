import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { lucideShield, lucideSettings, lucideKey } from '@ng-icons/lucide';
import { TranslocoService, translateSignal } from '@jsverse/transloco';

type SettingsMenuItem = {
  readonly label: () => string;
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
  private readonly transloco = inject(TranslocoService);
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
    },
    {
      label: translateSignal('settings.privacy'),
      icon: 'lucideShield',
      path: '/settings/privacy',
    },
  ];
}
