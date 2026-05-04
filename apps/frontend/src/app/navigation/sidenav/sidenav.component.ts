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
  ],
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent {
  private readonly router = inject(Router);
  protected readonly isRoot = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url === '/'),
    ),
    {
      initialValue: this.router.url === '/',
    },
  );
}
