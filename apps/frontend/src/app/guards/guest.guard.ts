import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';

export const guestGuard: CanActivateFn = async () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const cachedSession = authSession.session();

  if (cachedSession) {
    return router.createUrlTree(['/jobs']);
  }

  const session = await authSession.loadSession();

  if (!session) {
    return true;
  }

  return router.createUrlTree(['/jobs']);
};
