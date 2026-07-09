import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  authSessionFixtures,
  createAuthSessionServiceMock,
} from '@job-tracker-lite-angular/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('authGuard', () => {
  let router: Router;
  let authSessionServiceMock: ReturnType<typeof createAuthSessionServiceMock>;

  beforeEach(() => {
    authSessionServiceMock = createAuthSessionServiceMock(() => vi.fn());

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthSessionService,
          useValue: authSessionServiceMock,
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should allow navigation for authenticated users', async () => {
    authSessionServiceMock.loadSession.mockResolvedValue(
      authSessionFixtures.authenticated,
    );

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/jobs' } as never),
    );

    expect(result).toBe(true);
  });

  it('should redirect guests to login', async () => {
    authSessionServiceMock.loadSession.mockResolvedValue(
      authSessionFixtures.guest,
    );

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });

  it('should redirect pending deletion users to delete pending page', async () => {
    authSessionServiceMock.loadSession.mockResolvedValue(
      authSessionFixtures.pendingDeletion,
    );
    authSessionServiceMock.isPendingDeletion.mockReturnValue(true);

    const allowResult = await TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/privacy/delete-pending' } as never),
    );

    // Guard redirects pending sessions to the delete-pending page
    expect(allowResult instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(allowResult as UrlTree)).toBe(
      '/privacy/delete-pending',
    );

    // Active user should be prevented from visiting delete-pending
    authSessionServiceMock.loadSession.mockResolvedValue(
      authSessionFixtures.authenticated,
    );
    authSessionServiceMock.isPendingDeletion.mockReturnValue(false);

    const redirectResult = await TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/privacy/delete-pending' } as never),
    );

    expect(redirectResult instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(redirectResult as UrlTree)).toBe('/');
  });
});
