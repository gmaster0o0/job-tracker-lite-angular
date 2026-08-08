import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  authSessionFixtures,
  createAuthSessionServiceMock,
} from '@job-tracker-lite-angular/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasRoleGuard } from './has-role.guard';

describe('hasRoleGuard', () => {
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

  it('should allow users with an allowed role', async () => {
    authSessionServiceMock.session.mockReturnValue(
      authSessionFixtures.authenticated,
    );
    authSessionServiceMock.role.mockReturnValue('ADMIN');

    const result = await TestBed.runInInjectionContext(() =>
      hasRoleGuard(['ADMIN', 'MODERATOR'])({} as never, {} as never),
    );

    expect(result).toBe(true);
  });

  it('should redirect guests to login', async () => {
    authSessionServiceMock.session.mockReturnValue(authSessionFixtures.guest);

    const result = await TestBed.runInInjectionContext(() =>
      hasRoleGuard(['ADMIN'])({} as never, {} as never),
    );

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });

  it('should redirect users without the required role to home', async () => {
    authSessionServiceMock.session.mockReturnValue(
      authSessionFixtures.recruiter,
    );
    authSessionServiceMock.role.mockReturnValue('RECRUITER');

    const result = await TestBed.runInInjectionContext(() =>
      hasRoleGuard(['ADMIN'])({} as never, {} as never),
    );

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });
});
