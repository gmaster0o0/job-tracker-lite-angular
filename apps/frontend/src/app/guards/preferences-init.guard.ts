import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserPreferencesService } from '@job-tracker-lite-angular/frontend-data-access';

// Loads and applies stored theme/language/date-format preferences before
// the main layout renders. Without this, UserPreferencesService (a
// providedIn:'root' singleton) is never constructed until the user visits
// /settings/preferences - the only place that injects it - so a fresh page
// load renders with defaults instead of the user's saved preferences.
export const preferencesInitGuard: CanActivateFn = async () => {
  const preferences = inject(UserPreferencesService);
  await preferences.init();
  return true;
};
