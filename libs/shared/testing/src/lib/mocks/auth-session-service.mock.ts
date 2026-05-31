import { AuthSessionDto } from '@job-tracker-lite-angular/schemas';
import { authSessionFixtures } from '../fixtures/auth.fixtures';

export type AuthSessionServiceMockOptions = {
  loadSession?: () => Promise<AuthSessionDto>;
};

export function createAuthSessionServiceMock(
  mockFactory: () => any,
  options: AuthSessionServiceMockOptions = {},
) {
  return {
    loadSession: options.loadSession ?? mockFactory(),
    setSession: mockFactory(),
    clearSession: mockFactory(),
    session: mockFactory(),
    isAuthenticated: mockFactory(),
    userId: mockFactory(),
    __fixtures: {
      authenticated: authSessionFixtures.authenticated,
      guest: authSessionFixtures.guest,
    },
  };
}
