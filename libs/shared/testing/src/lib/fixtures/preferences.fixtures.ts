import {
  DEFAULT_USER_PREFERENCES,
  UpdateUserPreferencesDto,
  UserPreferencesDto,
} from '@job-tracker-lite-angular/schemas';

export const userPreferencesFixtures = {
  johnDoe: {
    theme: 'dark',
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    updatedAt: '2026-07-01T10:00:00.000Z',
  } as UserPreferencesDto,
  default: DEFAULT_USER_PREFERENCES,
};

export const updateUserPreferencesFixtures = {
  updateTheme: {
    theme: 'dark',
    updatedAt: '2026-07-21T12:00:00.000Z',
  } as UpdateUserPreferencesDto,
};
