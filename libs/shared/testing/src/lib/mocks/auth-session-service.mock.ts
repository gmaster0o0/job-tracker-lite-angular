import { AuthSessionDto } from '@job-tracker-lite-angular/schemas';
import { authSessionFixtures } from '../fixtures/auth.fixtures';

export type AuthSessionServiceMockOptions = {
  loadSession?: () => Promise<AuthSessionDto>;
};

export function createAuthSessionServiceMock(
  mockFactory: () => any,
  options: AuthSessionServiceMockOptions = {},
) {
  let currentSession: AuthSessionDto = authSessionFixtures.guest;

  const loadSession = options.loadSession ?? mockFactory();
  const setSession = mockFactory();
  const clearSession = mockFactory();
  const isPendingDeletion = mockFactory();

  if (
    !options.loadSession &&
    typeof loadSession.mockImplementation === 'function'
  ) {
    loadSession.mockImplementation(async () => currentSession);
  }

  if (typeof setSession.mockImplementation === 'function') {
    setSession.mockImplementation((session: AuthSessionDto) => {
      currentSession = session;
    });
  }

  if (typeof clearSession.mockImplementation === 'function') {
    clearSession.mockImplementation(() => {
      currentSession = authSessionFixtures.guest;
    });
  }

  if (typeof isPendingDeletion.mockImplementation === 'function') {
    isPendingDeletion.mockImplementation(
      () => currentSession?.user.status === 'PENDING_DELETION',
    );
  }

  return {
    loadSession,
    setSession,
    clearSession,
    session: mockFactory(),
    isAuthenticated: mockFactory(),
    userId: mockFactory(),
    isPendingDeletion,
    __fixtures: {
      authenticated: authSessionFixtures.authenticated,
      pendingDeletion: authSessionFixtures.pendingDeletion,
      guest: authSessionFixtures.guest,
    },
  };
}
