import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthSessionService } from './auth-session.service';
import { AuthDataAccessService } from '../data-access/auth.data-access';
import {
  authSessionFixtures,
  createAuthDataAccessMock,
} from '@job-tracker-lite-angular/testing';

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let authDataAccessMock: ReturnType<typeof createAuthDataAccessMock>;

  beforeEach(() => {
    authDataAccessMock = createAuthDataAccessMock();
    vi.spyOn(authDataAccessMock, 'getSession');

    TestBed.configureTestingModule({
      providers: [
        AuthSessionService,
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
      ],
    });

    service = TestBed.inject(AuthSessionService);
  });

  it('should load and store authenticated session', async () => {
    vi.mocked(authDataAccessMock.getSession).mockResolvedValue(
      authSessionFixtures.authenticated,
    );

    await expect(service.loadSession()).resolves.toEqual(
      authSessionFixtures.authenticated,
    );
    expect(service.session()).toEqual(authSessionFixtures.authenticated);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userId()).toBe(authSessionFixtures.authenticated?.user.id);
  });

  it('should clear authenticated state when no session is returned', async () => {
    service.setSession(authSessionFixtures.authenticated);
    vi.mocked(authDataAccessMock.getSession).mockResolvedValue(
      authSessionFixtures.guest,
    );

    await service.loadSession();

    expect(service.session()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userId()).toBeNull();
  });

  it('should clear session explicitly', () => {
    service.setSession(authSessionFixtures.authenticated);

    service.clearSession();

    expect(service.session()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
