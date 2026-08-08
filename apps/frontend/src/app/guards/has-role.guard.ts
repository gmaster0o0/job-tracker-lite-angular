import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';

export const hasRoleGuard =
  (allowedRoles: string[]): CanActivateFn =>
  () => {
    const authSession = inject(AuthSessionService);
    const router = inject(Router);
    const session = authSession.session();

    if (!session) {
      return router.createUrlTree(['/auth/login']);
    }

    const userRole = authSession.role();

    if (!allowedRoles.includes(userRole)) {
      return router.createUrlTree(['/']);
    }

    return true;
  };
