import { Component } from '@angular/core';
import { HlmSidebarImports } from '@shared-ui/helm/sidebar';
import { HlmIconImports } from '@shared-ui/helm/icon';
import { HlmButtonImports } from '@shared-ui/helm/button';
import { provideIcons } from '@ng-icons/core';
import { lucideLogOut } from '@ng-icons/lucide';
@Component({
  standalone: true,
  selector: 'app-sidenav',
  providers: [
    provideIcons({
      lucideLogOut,
    }),
  ],
  imports: [HlmSidebarImports, HlmIconImports, HlmButtonImports],
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent {}
