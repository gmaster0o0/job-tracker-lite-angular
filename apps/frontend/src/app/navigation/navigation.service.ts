import { Location } from '@angular/common';
import { inject, Injectable, Signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthDataAccessService,
  AuthSessionService,
} from '@job-tracker-lite-angular/frontend-data-access';

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
  private readonly authDataAccess = inject(AuthDataAccessService);
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
    if (this.router.navigated) {
      this.location.back();
      return;
    }

    void this.router.navigateByUrl('/');
  }

  async handleLogout(stateData?: Record<string, any>): Promise<void> {
    await this.authDataAccess.signOut();
    this.authSession.clearSession();
    await this.router.navigateByUrl('/auth/login', { state: stateData });
  }
}
