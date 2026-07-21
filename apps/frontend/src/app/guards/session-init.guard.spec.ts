import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { sessionInitGuard } from './session-init.guard';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  authSessionFixtures,
  createAuthSessionServiceMock,
} from '@job-tracker-lite-angular/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('sessionInitGuard', () => {
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
  });

  it('loads the session and allows navigation', async () => {
    authSessionServiceMock.loadSession.mockResolvedValue(
      authSessionFixtures.authenticated,
    );

    const result = await TestBed.runInInjectionContext(() =>
      sessionInitGuard({} as never, {} as never),
    );

    expect(authSessionServiceMock.loadSession).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('still allows navigation when no session is found', async () => {
    authSessionServiceMock.loadSession.mockResolvedValue(
      authSessionFixtures.guest,
    );

    const result = await TestBed.runInInjectionContext(() =>
      sessionInitGuard({} as never, {} as never),
    );

    expect(result).toBe(true);
  });
});
