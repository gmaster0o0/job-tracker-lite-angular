import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';

// Reads the already-loaded session synchronously - see auth.guard.ts.
export const guestGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const session = authSession.session();

  if (!session) {
    return true;
  }

  return router.createUrlTree(['/jobs']);
};
