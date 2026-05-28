import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth.store';

export const guestGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isInitialized()) {
    await authStore.loadSession();
  }

  return authStore.isAuthenticated() ? router.parseUrl('/jobs') : true;
};
