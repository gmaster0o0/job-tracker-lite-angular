import { Location } from '@angular/common';
import { inject, Injectable, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';

export interface MenuItem {
  readonly label: Signal<string>;
  readonly icon: string;
  readonly path: string;
  readonly requiresAuth?: boolean;
  readonly questOnly?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly authSession = inject(AuthSessionService);
  protected readonly isAuthenticated = this.authSession.isAuthenticated;
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  isItemVisible(item: MenuItem): boolean {
    const isAuthenticated = this.isAuthenticated();

    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }

    if (item.questOnly && isAuthenticated) {
      return false;
    }

    return true;
  }

  handleBack(): void {
    const currentUrl = this.router.url.split('?')[0];

    if (currentUrl.startsWith('/jobs/') && currentUrl !== '/jobs') {
      void this.router.navigateByUrl('/');
      return;
    }

    const segments = currentUrl.split('/').filter(Boolean);
    if (segments.length > 1) {
      segments.pop();
      void this.router.navigateByUrl('/' + segments.join('/'));
    } else {
      void this.router.navigateByUrl('/');
    }
  }
}
