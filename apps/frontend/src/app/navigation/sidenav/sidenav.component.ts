import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideArrowLeft } from '@ng-icons/lucide';
@Component({
  standalone: true,
  selector: 'app-sidenav',
  providers: [
    provideIcons({
      lucideLogOut,
      lucideArrowLeft,
    }),
  ],
  imports: [HlmSidebarImports, HlmIconImports, HlmButtonImports, RouterLink],
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent {}
