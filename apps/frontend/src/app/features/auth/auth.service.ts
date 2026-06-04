import { inject, Injectable } from '@angular/core';
import {
  AuthDataAccessService,
  AuthSessionService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authSession = inject(AuthSessionService);
  private readonly authDataAccess = inject(AuthDataAccessService);
  private readonly router = inject(Router);

  async handleLogout(stateData?: Record<string, any>): Promise<void> {
    await this.authDataAccess.signOut();
    this.authSession.clearSession();
    await this.router.navigateByUrl('/auth/login', { state: stateData });
  }
}
