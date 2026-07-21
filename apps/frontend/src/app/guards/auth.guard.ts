import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';

export const authGuard: CanActivateFn = (_route, state) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const session = authSession.session();
  const target = state?.url ?? '';

  if (!session) {
    return router.createUrlTree(['/auth/login']);
  }

  if (target.startsWith('/privacy/delete-pending')) {
    return authSession.isPendingDeletion() ? true : router.createUrlTree(['/']);
  }

  if (authSession.isPendingDeletion()) {
    return router.createUrlTree(['/privacy/delete-pending']);
  }

  return true;
};
