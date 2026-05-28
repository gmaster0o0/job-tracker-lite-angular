import { TestBed } from '@angular/core/testing';
import { AuthDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  authCredentialsFixtures,
  authSessionFixtures,
  createAuthDataAccessMock,
} from '@job-tracker-lite-angular/testing';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: AuthStore;
  let authDataAccessMock: ReturnType<typeof createAuthDataAccessMock>;

  beforeEach(() => {
    authDataAccessMock = createAuthDataAccessMock({
      session: authSessionFixtures.guest,
    });

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  it('should start as guest', () => {
    expect(store.isAuthenticated()).toBe(false);
    expect(store.session()).toBeNull();
  });

  it('should load an authenticated session', async () => {
    authDataAccessMock = createAuthDataAccessMock({
      session: authSessionFixtures.authenticated,
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
      ],
    });

    store = TestBed.inject(AuthStore);

    await store.loadSession();

    expect(store.isAuthenticated()).toBe(true);
    expect(store.user()?.email).toBe('auth.user@example.com');
  });

  it('should call sign-in and store session', async () => {
    await store.signIn(authCredentialsFixtures.validLogin);

    expect(authDataAccessMock.__calls.signInCalls).toEqual([
      authCredentialsFixtures.validLogin,
    ]);
    expect(store.isAuthenticated()).toBe(true);
  });

  it('should call change-password endpoint', async () => {
    await store.changePassword(authCredentialsFixtures.validChangePassword);

    expect(authDataAccessMock.__calls.changePasswordCalls).toEqual([
      authCredentialsFixtures.validChangePassword,
    ]);
  });
});
