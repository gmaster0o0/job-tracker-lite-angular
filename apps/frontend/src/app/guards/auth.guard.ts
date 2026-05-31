import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';

export const authGuard: CanActivateFn = async () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const cachedSession = authSession.session();

  if (cachedSession) {
    return true;
  }

  const session = await authSession.loadSession();

  if (session) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
