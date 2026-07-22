import {
  UpdateUserPreferencesDto,
  UserPreferencesDto,
} from '@job-tracker-lite-angular/schemas';
import { userPreferencesFixtures } from '../fixtures/preferences.fixtures';

export type PreferencesDataAccessMockOptions = {
  preferences?: UserPreferencesDto;
  getPreferences?: () => Promise<UserPreferencesDto>;
  updatePreferences?: (
    dto: UpdateUserPreferencesDto,
  ) => Promise<UserPreferencesDto>;
};

export function createPreferencesDataAccessMock(
  options: PreferencesDataAccessMockOptions = {},
) {
  const preferences = options.preferences ?? userPreferencesFixtures.default;

  return {
    getPreferences: options.getPreferences ?? (async () => preferences),
    updatePreferences: options.updatePreferences ?? (async () => preferences),
  };
}

export const createPreferencesServiceMock = (
  mockFactory: (fn?: any) => any = (fn) => fn,
) => ({
  getPreferences: mockFactory(),
  updatePreferences: mockFactory(),
});
