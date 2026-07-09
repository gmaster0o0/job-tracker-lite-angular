import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const session = await authSession.loadSession();

  if (!session) {
    return router.createUrlTree(['/auth/login']);
  }

  if (authSession.isPendingDeletion()) {
    return router.createUrlTree(['/privacy/delete-pending']);
  }

  // If user is trying to access the delete-pending page, only allow when session indicates pending deletion
  const target = state?.url ?? '';
  if (target.startsWith('/privacy/delete-pending')) {
    if (!authSession.isPendingDeletion()) {
      return router.createUrlTree(['/']);
    }
    return true;
  }

  // Otherwise allow navigation (component handles UI and any further checks)
  return true;
};
