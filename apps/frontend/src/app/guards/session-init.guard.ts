import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';

// Loads the session before the main layout (and its nav, which reads
// isAuthenticated) renders. Attached to the layout route itself so pages
// outside it - like /status, a public diagnostics page with no nav - never
// trigger this DB-backed lookup at all.
export const sessionInitGuard: CanActivateFn = async () => {
  const authSession = inject(AuthSessionService);
  await authSession.loadSession();
  return true;
};
